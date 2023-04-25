using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet]
        public IEnumerable<Client>? Get()
        {
            return aLogsReader.ClientsDictionary?.Values.ToArray();
        }
    }
}