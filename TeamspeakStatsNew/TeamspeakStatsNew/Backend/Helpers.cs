using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace TeamspeakStatsNew.Backend
{
    public static class Helpers
    {

        public static bool IsETagValid(Client[] parClientArray, HttpRequest parRequest, HttpResponse parResponse)
        {
            var hash = ComputeHash(parClientArray); // Compute a hash of the clients array
            var etag = Convert.ToBase64String(Encoding.UTF8.GetBytes(hash)); // Convert the hash to a base64 string

            // Set the ETag header in the response
            parResponse.Headers.Add("ETag", etag);

            // Check if the If-None-Match header matches the current ETag
            var ifNoneMatch = parRequest.Headers["If-None-Match"].FirstOrDefault();
            if (ifNoneMatch != null && ifNoneMatch.Equals(etag))
            {
                return true; // ETag is valid, return true
            }

            return false; // ETag is not valid, return false
        }

        public static bool IsETagValid(SortedDictionary<DateTime, int>? sortedDictionary, HttpRequest parRequest, HttpResponse parResponse)
        {

            var hash = ComputeHash(sortedDictionary); // Compute a hash of the clients array
            var etag = Convert.ToBase64String(Encoding.UTF8.GetBytes(hash)); // Convert the hash to a base64 string

            // Set the ETag header in the response
            parResponse.Headers.Add("ETag", etag);

            // Check if the If-None-Match header matches the current ETag
            var ifNoneMatch = parRequest.Headers["If-None-Match"].FirstOrDefault();

            if (ifNoneMatch != null && ifNoneMatch.Equals(etag))
            {
                return true; // ETag is valid, return true
            }

            return false; // ETag is not valid, return false
        }


        private static string ComputeHash(IEnumerable<Client> parClientsArray)
        {
            using SHA256? sha256 = SHA256.Create();
            string json = JsonSerializer.Serialize(parClientsArray);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            byte[] hashBytes = sha256.ComputeHash(bytes);
            string hash = Convert.ToBase64String(hashBytes);
            return hash;
        }

        private static string ComputeHash(SortedDictionary<DateTime, int>? parSortedDictionary)
        {
            using SHA256 sha256 = SHA256.Create();
            string json = JsonSerializer.Serialize(parSortedDictionary);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            byte[] hashBytes = sha256.ComputeHash(bytes);
            string hash = Convert.ToBase64String(hashBytes);
            return hash;
        }
    }
}
