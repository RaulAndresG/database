const express = require('express');
const fs = require('fs').promises;
const path = require('path');






const app = express();
const PORT = 20000;

app.use(express.json());

const DATA_FOLDER = 'data';

/**
 * Load data from JSON file
 * @param {String} entity - Entity name
 * @returns {Object} Object with data from JSON file
 */
async function loadData(fileName) {
  try {
    const filePath = path.join(__dirname, 'data', `${fileName}.json`);
    const jsonData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    throw new Error(`Error reading ${fileName} JSON file: ${error.message}`);
  }
}
// **Servicio 1: **

// Ruta para consultar las cuentas y formularios a los que el usuario tiene acceso
app.get('/users/:userId/access', async (req, res) => {
  const { userId } = req.params;
  try {
    const userData = await loadData('users');
    console.log('userData:', userData); 

    const user = userData[userId];
    console.log('user:', user); 

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userAccounts = [];
    const userForms = [];

    for (const [accountKey, accountValue] of Object.entries(user.accounts)) {
      const accountName = accountValue.name;
      const accountRole = accountValue.role; 

      if (accountRole) {
        const accountData = await loadData('accounts');
        const accountRoles = accountData[accountKey].roles;
        const rolePermissions = accountRoles[accountRole].permissions;

        for (const [formKey, formValue] of Object.entries(rolePermissions)) {
          if (formValue.read) {
            userAccounts.push(accountName);
            userForms.push({ account: accountName, form: formKey });
          }
        }
      }
    }

    console.log('userAccounts:', userAccounts); 
    console.log('userForms:', userForms);

    const response = {
      accounts: userAccounts,
      forms: userForms
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
       
// **Servicio 2: Crear registro de cosecha**
app.post('/accounts/:accountId/harvest', async (req, res) => {
  const { accountId } = req.params;
  const { fields } = req.body;

  try {
    const formsData = await loadData('forms');
    const harvestForm = formsData.form1;

    if (!harvestForm) {
      return res.status(500).json({ error: 'Harvest form not found' });
    }

    const allowedFields = harvestForm.fields.map(field => field.field);
    const receivedFields = Object.keys(fields);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
    }

    const timestamp = Date.now();
    const fileName = `${accountId}_${timestamp}.json`;

    const harvestRecordsDir = path.join(__dirname, 'data', 'harvest_records');

    await fs.access(harvestRecordsDir, fs.constants.F_OK)
      .catch(() => fs.mkdir(harvestRecordsDir, { recursive: true }));



      
    const filePath = path.join(harvestRecordsDir, fileName);
    await fs.writeFile(filePath, JSON.stringify({ accountId, fields }));

    res.status(201).json({ message: 'Harvest record created successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
async function loadData(fileName) {
  const filePath = path.join(__dirname, 'data', `${fileName}.json`);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

// **Servicio 3: **
const dataDir = path.join(__dirname, 'data');
const fermentationRecordsDir = path.join(dataDir, 'fermentation_records');
(async () => {
  try {
    await fs.access(fermentationRecordsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Creating fermentation_records directory...');
      await fs.mkdir(fermentationRecordsDir);
    } else {
      console.error('Error checking fermentation_records directory:', error);
    }
  }
})();
app.post('/accounts/:fermentationid/fermentation', async (req, res) => {
  const { fermentationid } = req.params;
  const { fields } = req.body;
  try {
    const formsData = await loadData('forms');
    const fermentationForm = formsData.form3;
    if (!fermentationForm) {
      return res.status(500).json({ error: 'Fermentation form not found' });
    }
    const allowedFields = fermentationForm.fields.map(field => field.field);
    const receivedFields = Object.keys(fields);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
    }
    const startDate = new Date(fields.start_date);
    const endDate = new Date(fields.end_date);
    if (endDate < startDate) {
      return res.status(400).json({ error: 'End date must be greater than or equal to start date' });
    }
    const inputWeight = parseFloat(fields.input);
    const outputWeight = parseFloat(fields.output);
    if (outputWeight > inputWeight) {
      return res.status(400).json({ error: 'Output weight cannot exceed input weight' });
    }
    const timestamp = Date.now();
    const fileName = `${fermentationid}_${timestamp}.json`;

    const filePath = path.join(fermentationRecordsDir, fileName);

    await fs.writeFile(filePath, JSON.stringify({ fermentationid, fields }));


    res.status(201).json({ message: 'Fermentation record created successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/accounts/:fermentationid/fermentation', async (req, res) => {
  const { fermentationid } = req.params;

  try {
    const files = await fs.readdir(fermentationRecordsDir);

    const accountFiles = files.filter(file => file.startsWith(`${fermentationid}_`));

    const fermentationData = await Promise.all(
      accountFiles.map(async file => {
        const filePath = path.join(fermentationRecordsDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
      })
    );

    const summary = calculateSummary(fermentationData);

    res.status(200).json({ data: fermentationData, summary });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function calculateSummary(fermentationData) {
  let totalDays = 0;
  let totalWeightLoss = 0;
  let totalCount = 0;

  fermentationData.forEach(record => {
    const startDate = new Date(record.fields.start_date);
    const endDate = new Date(record.fields.end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    totalDays += days;

    const inputWeight = parseFloat(record.fields.input);
    const outputWeight = parseFloat(record.fields.output);
    const weightLoss = inputWeight - outputWeight;
    totalWeightLoss += weightLoss;

    totalCount++;
  });

  const avgDays = totalDays / totalCount;
  const avgWeightLoss = totalWeightLoss / totalCount;

  return { avg_days: avgDays, avg_weight_loss: avgWeightLoss };
}

app.put('/accounts/:accountId/fermentation/:fermentationId', async (req, res) => {
  const { accountId, fermentationId } = req.params;
  const { fields } = req.body;

  try {
    const accountData = await loadData('accounts');
    const account = accountData[accountId];
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Verificar si existen registros de fermentación en la cuenta
    if (!account.fermentationRecords || !Object.keys(account.fermentationRecords).length) {
      return res.status(404).json({ error: 'Fermentation records not found' });
    }

    const fermentationRecord = account.fermentationRecords.find(record => record.id === fermentationId);
    if (!fermentationRecord) {
      return res.status(404).json({ error: 'Fermentation record not found' });
    }

    const userPermission = getUserPermission(account, req.headers.userId);
    if (!userPermission.update) {
      return res.status(403).json({ error: 'Unauthorized: Insufficient permissions' });
    }

    const formData = await loadData('forms');
    const formDefinition = formData.form3;
    const allowedFields = formDefinition.fields.map(field => field.field);
    const receivedFields = Object.keys(fields);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Invalid field(s): ${invalidFields.join(', ')}` });
    }

    Object.assign(fermentationRecord.fields, fields);

    await saveData('accounts', accountData);

    res.json({ message: 'Fermentation record updated successfully', data: fermentationRecord });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});










/**
 * Save data to JSON file
 * @param {String} entity - Entity name
 * @param {Object} data - Data to save to JSON file
 */
const saveData = async (entity, data) => {
  try {
    await fs.writeFile(`${DATA_FOLDER}/${entity}.json`, JSON.stringify(data, null, 4), 'utf8');
  } catch (err) {
    console.error(`Error saving ${entity} data to JSON file:`, err);
  }
};

app.get('/:entity', async (req, res) => {
  const { entity } = req.params;
  const data = await loadData(entity);
  res.json(data);
});

app.get('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const data = await loadData(entity);
  if (!data[id]) {
    return res.status(404).send('Record not found');
  }
  res.json(data[id]);
});

app.post('/:entity', async (req, res) => {
  const { entity } = req.params;
  const id = Date.now();
  const record = req.body;
  const data = await loadData(entity);
  data[id] = record;
  await saveData(entity, data);
  res.status(201).send('Record added');
});

app.put('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const record = req.body;
  const data = await loadData(entity);
  if (!data[id]) {
    return res.status(404).send('Record not found');
  }
  data[id] = record;
  await saveData(entity, data);
  res.send('Record updated');
});

app.delete('/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  const data = await loadData(entity);
  if (!data[id]) {
    return res.status(404).send('Record not found');
  }
  delete data[id];
  await saveData(entity, data);
  res.send('Record deleted');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
