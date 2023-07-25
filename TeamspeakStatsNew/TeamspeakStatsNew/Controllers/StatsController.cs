using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
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
                if (Helpers.IsETagValid(clientDictionary, Request, HttpContext.Response))
                {
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

            if (Helpers.IsETagValid(connectedClientsRelativeToPeriod, Request, Response))
            {
                return StatusCode(StatusCodes.Status304NotModified);
            }

            // Return the data as usual
            var json = JsonSerializer.Serialize(connectedClientsRelativeToPeriod);

            // Return the JSON data
            return Ok(json);
        }
    }
}