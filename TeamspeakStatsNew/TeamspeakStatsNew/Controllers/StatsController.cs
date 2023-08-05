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

        public StatsController(ILogger<StatsController> parLogger, LogsReader parLogsReader, FolderMonitor parFolderMonitor)
        {
            aParLogger = parLogger;
            aLogsReader = parLogsReader;
            aFolderMonitor = parFolderMonitor;
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
        public ActionResult<string> GetClientsConnRelativeToPeriod(string? period = "", DateTime relevantDateTime = default)
        {

            SortedDictionary<DateTime, int>? connectedClientsRelativeToPeriod;

            if (aLogsReader.ClientConnectedDataDictionary == null || aLogsReader.ClientsDictionary == null)
            {
                return BadRequest("Logs not year initialized");
            }

            switch (period)
            {
                case "day":
                    connectedClientsRelativeToPeriod = aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountDays;
                    break;
                case "month":
                    connectedClientsRelativeToPeriod = aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountMonths;
                    break;
                case "year":
                    connectedClientsRelativeToPeriod = aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountYears;
                    break;
                default:
                    connectedClientsRelativeToPeriod = aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountHours;
                    break;
            }

            if (connectedClientsRelativeToPeriod == null || period == null)
            {
                return BadRequest("Error during processing");
            }

            connectedClientsRelativeToPeriod = FilterRelevantDataPeriod(connectedClientsRelativeToPeriod, period, relevantDateTime);

            if (Helpers.IsETagValid(connectedClientsRelativeToPeriod, Request, Response))
            {
                return StatusCode(StatusCodes.Status304NotModified);
            }

            // Return the data as usual
            var json = JsonSerializer.Serialize(connectedClientsRelativeToPeriod);

            // Return the JSON data
            return Ok(json);
        }

        [HttpGet("allowed-range-relative-to")]
        public ActionResult<string> GetAllowedRangeConnRelativeToPeriod()
        {

            if (aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountHours != null)
            {
                if (Helpers.IsETagValid(aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountHours, Request, HttpContext.Response))
                {
                    return StatusCode(StatusCodes.Status304NotModified);
                }
            }

            if (aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountHours == null)
            {
                return BadRequest("Logs not year initialized");
            }

            DateTime minDate = aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountHours.FirstOrDefault().Key;
            DateTime maxDate = aLogsReader.aCountOfClientsRelativeToPeriod.DictionaryCountHours.LastOrDefault().Key;

            // Return the data as usual
            var json = JsonSerializer.Serialize(new[] { minDate, maxDate });

            // Return the JSON data
            return Ok(json);
        }

        public SortedDictionary<DateTime, int> FilterRelevantDataPeriod(SortedDictionary<DateTime, int> parDictionaryOfClients, string parPeriod, DateTime relevantDateTime)
        {

            string tmpPeriodFirstUpperCase = char.ToUpper(parPeriod[0]) + parPeriod.Substring(1);

            Enum.TryParse(tmpPeriodFirstUpperCase, out Periods period);

            return new SortedDictionary<DateTime, int>(parDictionaryOfClients.Where(x =>
            {
                switch (period)
                {
                    case Periods.Hour:
                        return x.Key.Year == relevantDateTime.Year &&
                               x.Key.Month == relevantDateTime.Month &&
                               x.Key.Day == relevantDateTime.Day;
                    case Periods.Day:
                        return x.Key.Year == relevantDateTime.Year &&
                               x.Key.Month == relevantDateTime.Month;
                    case Periods.Month:
                        return x.Key.Year == relevantDateTime.Year;
                    case Periods.Year:
                        return true;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }).ToDictionary(x => x.Key, x => x.Value));
        }
    }
}