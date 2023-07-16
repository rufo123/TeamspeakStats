using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using TeamspeakStatsNew.Backend;

namespace TeamspeakStatsNew.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly ILogger<StatsController> aParLogger;

        private readonly LogsReader aLogsReader;
        private readonly FolderMonitor aFolderMonitor;

        private readonly CountOfClientsRelativeToPeriod aCountOfClientsRelativeToPeriod;

        public StatsController(ILogger<StatsController> parLogger, LogsReader parLogsReader, FolderMonitor parFolderMonitor)
        {
            aParLogger = parLogger;
            aLogsReader = parLogsReader;
            aFolderMonitor = parFolderMonitor;
            aCountOfClientsRelativeToPeriod = new CountOfClientsRelativeToPeriod();
        }

        [HttpGet("clients")]
        public ActionResult<IEnumerable<Client>> Get(string? dateFrom = "")
        {

            Client[]? clientDictionary = aLogsReader.ClientsDictionary?.Values.ToArray();

            if (!DateTime.TryParse(dateFrom, out DateTime dateToCalculateFrom))
            {
                return BadRequest("Error reading Date From");
            }

            for (int i = 0; i < clientDictionary?.Length; i++)
            {
                clientDictionary[i].HoursTotal =
                    aLogsReader.CalculateTotalHoursOfClient(clientDictionary[i].Id, dateToCalculateFrom);
            }


            if (clientDictionary != null)
            {
                var hash = ComputeHash(clientDictionary); // Compute a hash of the clients array
                var etag = Convert.ToBase64String(Encoding.UTF8.GetBytes(hash)); // Convert the hash to a base64 string

                // Set the ETag header in the response
                HttpContext.Response.Headers.Add("ETag", etag);

                // Check if the If-None-Match header matches the current ETag
                var ifNoneMatch = Request.Headers["If-None-Match"].FirstOrDefault();
                if (ifNoneMatch != null && ifNoneMatch.Equals(etag))
                {
                    // Return a Not Modified response
                    return StatusCode(StatusCodes.Status304NotModified);
                }
            }

            // Return the data as usual
            return Ok(clientDictionary);
        }

        [HttpGet("conn-relative-to")]
        public ActionResult<string> GetClientsConnRelativeToPeriod(string? period = "")
        {

            SortedDictionary<DateTime, int>? connectedClientsRelativeToPeriod;

            if (aLogsReader.ClientConnectedDataDictionary == null || aLogsReader.ClientsDictionary == null)
            {
                return BadRequest("Logs not year initialized");
            }

            switch (period)
            {
                case "hour":
                    connectedClientsRelativeToPeriod = aCountOfClientsRelativeToPeriod.CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Hour, aLogsReader.ClientConnectedDataDictionary, aLogsReader.ClientsDictionary);
                    break;
                case "day":
                    connectedClientsRelativeToPeriod = aCountOfClientsRelativeToPeriod.CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Day, aLogsReader.ClientConnectedDataDictionary, aLogsReader.ClientsDictionary);
                    break;
                case "month":
                    connectedClientsRelativeToPeriod = aCountOfClientsRelativeToPeriod.CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Month, aLogsReader.ClientConnectedDataDictionary, aLogsReader.ClientsDictionary);
                    break;
                case "year":
                    connectedClientsRelativeToPeriod = aCountOfClientsRelativeToPeriod.CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Year, aLogsReader.ClientConnectedDataDictionary, aLogsReader.ClientsDictionary);
                    break;
                default:
                    connectedClientsRelativeToPeriod = aCountOfClientsRelativeToPeriod.CalculateCountOfPlayerHoursRelativeToPeriod(Periods.Hour, aLogsReader.ClientConnectedDataDictionary, aLogsReader.ClientsDictionary);
                    break;
            }


            var hash = ComputeHash(connectedClientsRelativeToPeriod); // Compute a hash of the clients array
            var etag = Convert.ToBase64String(Encoding.UTF8.GetBytes(hash)); // Convert the hash to a base64 string

            // Set the ETag header in the response
            HttpContext.Response.Headers.Add("ETag", etag);

            // Check if the If-None-Match header matches the current ETag
            var ifNoneMatch = Request.Headers["If-None-Match"].FirstOrDefault();
            if (ifNoneMatch != null && ifNoneMatch.Equals(etag))
            {
                // Return a Not Modified response
                return StatusCode(StatusCodes.Status304NotModified);
            }

            // Return the data as usual
            var json = JsonSerializer.Serialize(connectedClientsRelativeToPeriod);

            // Return the JSON data
            return Ok(json);
        }


        // ReSharper disable once MemberCanBeMadeStatic.Local
        #pragma warning disable CA1822
        private string ComputeHash(IEnumerable<Client> clients)
        #pragma warning restore CA1822
        {
            using SHA256? sha256 = SHA256.Create();
            string json = JsonSerializer.Serialize(clients);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            byte[] hashBytes = sha256.ComputeHash(bytes);
            string hash = Convert.ToBase64String(hashBytes);
            return hash;
        }

        #pragma warning disable CA1822
        private string ComputeHash(SortedDictionary<DateTime, int>? dictionary)
        #pragma warning restore CA1822
        {
            using SHA256 sha256 = SHA256.Create();
            string json = JsonSerializer.Serialize(dictionary);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            byte[] hashBytes = sha256.ComputeHash(bytes);
            string hash = Convert.ToBase64String(hashBytes);
            return hash;
        }
    }
}