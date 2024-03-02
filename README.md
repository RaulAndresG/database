README.md

¡Bienvenido a la Plataforma de Gestión de Registros de Cosecha y Fermentación!

Este repositorio contiene una aplicación de servidor Node.js diseñada para empresas dedicadas a la industria agrícola y de procesamiento de alimentos. Con esta aplicación, podrás gestionar de manera eficiente los registros de cosecha y fermentación de tus productos. A continuación, se detallan las instrucciones para configurar y utilizar la plataforma.
Requisitos Previos

Antes de comenzar, asegúrate de tener instalado Node.js y npm en tu sistema. Puedes descargarlos e instalarlos desde https://nodejs.org/.
Instalación

    Clona el Repositorio

    bash

git clone <URL_DEL_REPOSITORIO>

Instala las Dependencias

bash

    cd <DIRECTORIO_DEL_PROYECTO>
    npm install express fs path

Ejecución

    Inicia el Servidor

    node index.js

Uso

Una vez que el servidor esté en funcionamiento, puedes interactuar con los siguientes servicios a través de cualquier cliente HTTP, como Postman:

    Consultar Acceso a Cuentas y Formularios
        Método: GET
        URL: http://localhost:30000/users/:userId/access
        Descripción: Permite a los usuarios consultar las cuentas y formularios a los que tienen acceso.
        Parámetros:
            userId: ID del usuario para el que se consulta el acceso.

    Crear Registro de Cosecha
        Método: POST
        URL: http://localhost:30000/accounts/:accountId/harvest
        Descripción: Permite crear un nuevo registro de cosecha para una cuenta específica.
        Parámetros:
            accountId: ID de la cuenta para la que se crea el registro de cosecha.
        Cuerpo de la Solicitud:

        json

    {
      "fields": {
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "input": 100,
        "output": 75
      }
    }

Crear Registro de Fermentación

    Método: POST
    URL: http://localhost:30000/accounts/:fermentationid/fermentation
    Descripción: Permite crear un nuevo registro de fermentación para una cuenta específica.
    Parámetros:
        fermentationid: ID de la cuenta para la que se crea el registro de fermentación.
    Cuerpo de la Solicitud:

    json

    {
      "fields": {
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "input": 100,
        "output": 75
      }
    }

Actualizar Registro de Fermentación

    Método: PUT
    URL: http://localhost:30000/accounts/:accountId/fermentation/:fermentationId
    Descripción: Permite actualizar un registro de fermentación existente.
    Parámetros:
        accountId: ID de la cuenta a la que pertenece el registro de fermentación.
        fermentationId: ID del registro de fermentación que se desea actualizar.
    Cuerpo de la Solicitud:

    json

        {
          "fields": {
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD",
            "input": 120,
            "output": 80
          }
        }

Con estas instrucciones, podrás configurar y utilizar la plataforma de gestión de registros de cosecha y fermentación en tu empresa de manera eficaz. Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de soporte técnico. ¡Gracias por elegir nuestra solución para tus necesidades de gestión de datos agrícolas y de procesamiento de alimentos!
