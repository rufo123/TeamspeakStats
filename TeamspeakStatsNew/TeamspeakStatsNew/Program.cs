using TeamspeakStatsNew.Backend;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();

// Add the folder monitoring service

builder.Services.AddSingleton<LogsReader>(new LogsReader());
builder.Services.AddSingleton<FolderMonitor>(provider =>
{
    LogsReader? logsReader = provider.GetService<LogsReader>();
    return new FolderMonitor(logsReader!.LogsPath, () => logsReader.ReadLogs(logsReader.LogsPath));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;


app.Run();
