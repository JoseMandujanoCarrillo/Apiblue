using System;
using System.Collections.Generic;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using RestSharp;
using System.Threading;

class ApiTester
{
    static void Main(string[] args)
    {
        // Iniciar WebDriver de Chrome
        using (IWebDriver driver = new ChromeDriver())
        {
            // URL de Swagger
            string swaggerUrl = "http://localhost:3000/api-docs";
            driver.Navigate().GoToUrl(swaggerUrl);
            Thread.Sleep(2000); // Esperar a que cargue Swagger

            // Obtener todos los endpoints visibles en Swagger
            var endpoints = driver.FindElements(By.ClassName("opblock"));
            
            // Crear cliente para enviar solicitudes HTTP
            var client = new RestClient("http://localhost:3000");

            foreach (var endpoint in endpoints)
            {
                // Extraer método y nombre del endpoint
                var methodElement = endpoint.FindElement(By.ClassName("opblock-summary-method"));
                var pathElement = endpoint.FindElement(By.ClassName("opblock-summary-path"));
                
                string method = methodElement.Text;
                string path = pathElement.Text;
                Console.WriteLine($"Probando endpoint: {method} {path}");

                // Expande el endpoint para obtener detalles (en caso necesario)
                endpoint.Click();
                Thread.Sleep(500);

                // Preparar solicitud según el método
                var request = new RestRequest(path, method switch
                {
                    "GET" => Method.Get,
                    "POST" => Method.Post,
                    "PUT" => Method.Put,
                    "DELETE" => Method.Delete,
                    _ => throw new NotSupportedException($"Método {method} no soportado")
                });

                // Agregar el token JWT si es necesario
                request.AddHeader("Authorization", "Bearer TU_TOKEN_AQUI");

                // Para solicitudes POST y PUT, podrías agregar parámetros aquí
                if (method == "POST" || method == "PUT")
                {
                    request.AddJsonBody(new
                    {
                        // Completar con datos de prueba adecuados
                        exampleField = "exampleValue"
                    });
                }

                // Ejecutar la solicitud y obtener la respuesta
                var response = client.Execute(request);
                
                // Verificar el resultado
                Console.WriteLine($"Status Code: {response.StatusCode}");
                if (response.IsSuccessful)
                {
                    Console.WriteLine("Prueba exitosa.");
                }
                else
                {
                    Console.WriteLine("Error en la prueba.");
                    Console.WriteLine($"Contenido de respuesta: {response.Content}");
                }

                Thread.Sleep(500); // Esperar un poco entre solicitudes
            }

            driver.Quit();
        }
    }
}
