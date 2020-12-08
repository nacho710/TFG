


Cuando autorices mediante una cuenta de servicio, tienes dos opciones para proporcionar las credenciales a la aplicación. Puedes configurar la variable de entorno GOOGLE_APPLICATION_CREDENTIALS o pasar la ruta a la clave de la cuenta de servicio en el código de forma explícita. Recomendamos enfáticamente que uses la primera opción, ya que es más segura.

Para configurar la variable de entorno, haz lo siguiente:

Configura la variable de entorno GOOGLE_APPLICATION_CREDENTIALS con la ruta del archivo JSON que contiene la clave de tu cuenta de servicio. Esta variable solo se aplica a la sesión actual de Cloud Shell. Por lo tanto, si abres una sesión nueva, deberás volver a configurar la variable.
//esto es para windows

$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\arten\OneDrive\Escritorio\TFG\TFG\tfg-bed5d-firebase-adminsdk-sz3gp-e7ab447d01.json" //AQUI PONEr LA RUTA DEL ARCHIVO JSON y usar la powershell metiendo ese comando
