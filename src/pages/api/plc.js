import { S7Client } from "node-snap7";

export default async function handler(req, res) {
  const client = new S7Client();

  try {
    client.ConnectTo("192.168.10.3", 0, 0);

    const data = {
      Peso_Actual: client.ReadInt("DB1", 6),
      Comp_1_Estado: client.ReadBool("DB1", 8.1),
      Comp_2_Estado: client.ReadBool("DB1", 8.2),
      Comp_3_Estado: client.ReadBool("DB1", 8.3),
      FIN_de_Ciclo: client.ReadBool("DB1", 9.5),
      Sistema_ON: client.ReadBool("DB1", 8.6),
    };

    client.Disconnect();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error conectando al PLC:", error);
    res.status(500).json({ error: "Error conectando al PLC" });
  }
}