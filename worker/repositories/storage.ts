import FTP from "basic-ftp";

const clients = new Map<string, FTP.Client>();

async function getClient(hostname: string) {
  let client = clients.get(hostname);
  if (!client) {
    client = new FTP.Client();
    await client.access({
      host: hostname,
      port: 21,
    });
    clients.set(hostname, client);

    await new Promise((res) => {
      client?.connect().then(res);
    });
  }

  return client;
}

export async function downloadFile(
  id: string,
  remoteFile: string,
  downloadPath: string
) {
  const client = await getClient(id);
  await client.downloadTo(downloadPath, remoteFile);
}
