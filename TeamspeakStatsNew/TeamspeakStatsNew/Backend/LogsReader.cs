using System.Diagnostics;
using System.Text.RegularExpressions;

namespace TeamspeakStatsNew.Backend
{
    public class LogsReader
    {
        private readonly string aLogsPath;
        private Dictionary<int, Client>? aClientsDictionary;
        private Dictionary<int, ClientConnectedData>? aClientConnectedDataDictionary;
        private readonly Dictionary<int, int> aMergedIdsDictionary;
        private readonly HashSet<int> aBotsHashSet;
        private readonly object aLockObject = new object();

        public Dictionary<int, Client>? ClientsDictionary => aClientsDictionary;
        public Dictionary<int, ClientConnectedData>? ClientConnectedDataDictionary => aClientConnectedDataDictionary;

        public string LogsPath => aLogsPath;

        public LogsReader()
        {
            aClientsDictionary = null;
            aClientConnectedDataDictionary = null;
            aLogsPath = File.ReadAllText("Configuration/logs_path.txt");
            aMergedIdsDictionary = CreateMergedIdsDictionary(ReadMergedIds());
            aBotsHashSet = ReadBots();

            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            ReadLogs(aLogsPath);
            stopwatch.Stop();

            TimeSpan elapsedTime = stopwatch.Elapsed;
            Debug.WriteLine($"Execution time: {elapsedTime}");
        }

        public HashSet<int> ReadBots()
        {
            string filePath = "Configuration/bot_ids.txt";
            HashSet<int> data = new HashSet<int>(2);

            try
            {
                string[] lines = File.ReadAllLines(filePath);
                foreach (string line in lines)
                {
                    string[] parts = line.Split(',', StringSplitOptions.RemoveEmptyEntries);
                    int number = int.Parse(parts[0].Trim());
                    data.Add(number);
                }
            }
            catch (IOException ex)
            {
                Console.WriteLine($"Error reading file: {ex.Message}");
            }

            return data;
        }

        public List<List<int>> ReadMergedIds()
        {
            string filePath = "Configuration/merged_ids.txt";
            List<List<int>> mergedIdsList = new List<List<int>>();

            using (StreamReader reader = new StreamReader(filePath))
            {
                while (!reader.EndOfStream)
                {
                    string? line = reader.ReadLine();
                    List<int> numbers = new List<int>();

                    string[]? numberStrings = line?.Split(',');
                    if (numberStrings != null)
                        foreach (string numberString in numberStrings)
                        {
                            string trimmedString = numberString.Trim();
                            if (trimmedString.StartsWith("#"))
                            {
                                continue;
                            }

                            if (int.TryParse(trimmedString, out var number))
                            {
                                numbers.Add(number);
                            }
                        }

                    mergedIdsList.Add(numbers);
                }
            }

            return mergedIdsList;
        }

        public void ReadLogs(string parLogsPath)
        {
            lock (aLockObject)
            {

                string[] files = Directory.GetFiles(parLogsPath, "ts3server*_1.log"); // Get files matching the pattern

                Array.Sort(files, StringComparer.InvariantCulture); // Sort the files in ascending order

                Dictionary<int, Client> clientDictionaryTmp;
                Dictionary<int, ClientConnectedData> clientConnectedDataDictionaryTmp;

                if (aClientsDictionary is not null && aClientsDictionary.Count > 0)
                {
                    clientDictionaryTmp = new Dictionary<int, Client>(aClientsDictionary.Count);
                    clientConnectedDataDictionaryTmp = new Dictionary<int, ClientConnectedData>(aClientConnectedDataDictionary.Count);

                }
                else
                {
                    clientDictionaryTmp = new Dictionary<int, Client>(5000);
                    clientConnectedDataDictionaryTmp = new Dictionary<int, ClientConnectedData>(5000);
                }

                foreach (string file in files)
                {
                    bool fileLocked = true;

                    // Check if some of the users, are still not assigned as online
                    // Because one log file corresponds to one program run...
                    if (clientDictionaryTmp != null)
                    {
                        foreach (KeyValuePair<int, Client> client in clientDictionaryTmp.Where(u => u.Value.Online))
                        {
                            client.Value.Online = false;
                        }
                    }

                    while (fileLocked)
                    {
                        try
                        {

                            using (StreamReader reader = new StreamReader(file))
                            {
                                while (reader.ReadLine() is { } line)
                                {
                                    string[] fields = line.Split('|'); // Split the line using the '|' character

                                    if (fields.Length == 5)
                                    {
                                        DateTime date = DateTime.Parse(fields[0]);
                                        string messageType = fields[1];
                                        string location = fields[2];
                                        int type = int.Parse(fields[3]);
                                        string entryString = fields[4];


                                        string pattern =
                                            @"^client (connected|disconnected) '(.+)'(\(id:(\d+)\))(( from| using a myTeamSpeak ID from| reason) (.+))?$";
                                        Match match = Regex.Match(entryString, pattern);

                                        if (match.Success)
                                        {
                                            string action = match.Groups[1].Value;
                                            string name = match.Groups[2].Value;
                                            string id = match.Groups[4].Value;
                                            string extraInfo = match.Groups[5].Value;

                                            AddClient(Int32.Parse(id), name, clientDictionaryTmp, clientConnectedDataDictionaryTmp);

                                            Client? client = GetClient(Int32.Parse(id), clientDictionaryTmp);

                                            if (action == "connected")
                                            {
                                                if (client != null)
                                                {
                                                    client.Online = true;
                                                    client.LastConnected = date;
                                                    client.Bot = aBotsHashSet.Contains(Int32.Parse(id));
                                                }
                                            }
                                            else if (action == "disconnected")
                                            {
                                                client?.AddTotalTime(date);

                                                if (client != null)
                                                {
                                                    clientConnectedDataDictionaryTmp?[client.Id].ConnectionsDataListOfArrays.Add(new[] { date, client.LastConnected });
                                                    client.Online = false;
                                                    client.LastConnected = date;
                                                }

                                            }

                                        }


                                    }
                                }

                            }

                            fileLocked = false;

                        }

                        catch (IOException)
                        {
                            Thread.Sleep(100); // Wait for a short period before trying again
                        }
                    }


                }

                aClientsDictionary = clientDictionaryTmp;
                aClientConnectedDataDictionary = clientConnectedDataDictionaryTmp;
            }
        }

        public double CalculateMillisecondsConnected(DateTime parEndTime, DateTime parStartTime, DateTime parDateFrom)
        {
            bool skipReadingInvalid = false;

            if (parStartTime <= parDateFrom && parEndTime <= parDateFrom
               )
            {
                skipReadingInvalid = true;
            }
            else if (parStartTime <= parDateFrom && parEndTime > parDateFrom
                    )
            {
                parStartTime = parDateFrom;
            }

            if (!skipReadingInvalid)
            {
                TimeSpan test = parEndTime.Subtract(parStartTime);
                return test.TotalMilliseconds;

            }

            return 0;
        }

        public int CalculateTotalHoursOfClient(int parClientId, DateTime parDateFrom)
        {

            double totalMillisecondsConnected = 0.0d;

            if (aClientConnectedDataDictionary?[parClientId] != null)
            {

                foreach (var connectionDateEntry in aClientConnectedDataDictionary[parClientId].ConnectionsDataListOfArrays)
                {
                    DateTime endDateTime = connectionDateEntry[0];
                    DateTime startDateTime = connectionDateEntry[1];

                    totalMillisecondsConnected += CalculateMillisecondsConnected(endDateTime, startDateTime, parDateFrom);
                }

                if (aClientsDictionary != null && aClientsDictionary[parClientId].Online)
                {
                    totalMillisecondsConnected += CalculateMillisecondsConnected(DateTime.Now,
                        aClientsDictionary[parClientId].LastConnected, parDateFrom);
                }
            }

            return (int)(totalMillisecondsConnected / (1000 * 60 * 60));
        }

        public void AddClient(int parId, string parName, Dictionary<int, Client>? parClientDictionary, Dictionary<int, ClientConnectedData?> parClientConnectedDataDictionary)
        {
            int foundId = aMergedIdsDictionary.ContainsKey(parId) ? aMergedIdsDictionary[parId] : parId;

            if (parClientDictionary != null && parClientDictionary.TryGetValue(foundId, out Client? client))
            {
                client.AddName(parName);
            }
            else
            {
                Client newClient = new Client(foundId);
                parClientConnectedDataDictionary[foundId] = new ClientConnectedData(foundId);
                newClient.AddName(parName);
                if (parClientDictionary != null) parClientDictionary[foundId] = newClient;
            }
        }

        public Client? GetClient(int parId, Dictionary<int, Client> parClientDictionary)
        {
            int foundId = aMergedIdsDictionary.ContainsKey(parId) ? aMergedIdsDictionary[parId] : parId;
            return parClientDictionary?[foundId];
        }

        // ReSharper disable once MemberCanBeMadeStatic.Local
        private Dictionary<int, int> CreateMergedIdsDictionary(List<List<int>> mergedIdsList)
        {
            Dictionary<int, int> mergedIdsDictionary = new Dictionary<int, int>();
            foreach (List<int> list in mergedIdsList)
            {
                for (int i = 1; i < list.Count; i++)
                {
                    mergedIdsDictionary[list[i]] = list[0];
                }
            }
            return mergedIdsDictionary;
        }


    }
}
