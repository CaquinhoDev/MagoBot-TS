import { GroupMetadata } from "@whiskeysockets/baileys";
import path from "path";
import { promises as fsPromises } from "fs"; // Usando fs com promessas para operações assíncronas
import { emojis } from "../utils/emojis";
import { StickerBotCommand } from "../types/Command";
import { WAMessageExtended } from "../types/Message";
import { react, sendMessage } from "../utils/baileysHelper";
import { checkCommand } from "../utils/commandValidator";
import { capitalize } from "../utils/misc";
import { buscarImagem } from "../utils/imageSearch"; // Importação da função de busca de imagem

// Gets the extension of this file, to dynamically import '.ts' if in development and '.js' if in production
const extension = __filename.endsWith(".js") ? ".js" : ".ts";

// Gets the file name without the .ts/.js extension
const commandName = capitalize(path.basename(__filename, extension));

// Command settings:
export const command: StickerBotCommand = {
  name: commandName,
  aliases: ["imagem", "photo", "image"],
  desc: "Envia uma imagem relacionada a uma palavra-chave",
  example: undefined,
  needsPrefix: true,
  inMaintenance: false,
  runInPrivate: true,
  runInGroups: true,
  onlyInBotGroup: false,
  onlyBotAdmin: false,
  onlyAdmin: false,
  onlyVip: false,
  botMustBeAdmin: false,
  interval: 5,
  limiter: {}, // do not touch this
  run: async (
    jid: string,
    sender: string,
    message: WAMessageExtended,
    alias: string,
    body: string,
    group: GroupMetadata | undefined,
    isBotAdmin: boolean,
    isVip: boolean,
    isGroupAdmin: boolean,
    amAdmin: boolean
  ) => {
    const check = await checkCommand(
      jid,
      message,
      alias,
      group,
      isBotAdmin,
      isVip,
      isGroupAdmin,
      amAdmin,
      command
    );
    if (!check) return;

    // Remove o prefixo e a palavra 'imagem' do comando para capturar a palavra-chave
    const keyword = body.slice(alias.length).trim(); // Agora `keyword` será "carro"

    // Verifica se uma palavra-chave foi fornecida
    if (!keyword) {
      return await sendMessage(
        {
          text: "*Por favor, forneça uma palavra-chave para a busca de imagem.*",
        },
        message
      );
    }

    let tempFilePath;

    try {
      // Busca a imagem usando a função buscarImagem
      const imageBuffer = await buscarImagem(keyword);

      // Cria um arquivo temporário para salvar a imagem
      tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
      await fsPromises.writeFile(tempFilePath, imageBuffer); // Usando writeFile assíncrono

      // Envia a imagem como mídia
      await sendMessage(
        {
          image: { url: tempFilePath }, // Envia o arquivo temporário como mídia
          caption: `Imagem relacionada a "${keyword}"`,
        },
        message
      );

      // Reage com emoji de imagem
      await react(message, "🖼️");
    } catch (error) {
      // Em caso de erro, envia mensagem de erro
      console.error("Erro ao buscar a imagem:", error);
      await sendMessage({ text: `*Erro ao buscar a imagem:* ❌` }, message);
      await react(message, emojis.error);
    } finally {
      // Apaga o arquivo temporário após o envio, se ele foi criado
      if (tempFilePath) {
        try {
          // Atraso de 100 milissegundos
          await new Promise((resolve) => setTimeout(resolve, 100));
          await fsPromises.unlink(tempFilePath); // Usando unlink assíncrono
        } catch (unlinkError) {
          console.error("Erro ao deletar arquivo temporário:", unlinkError);
        }
      }
    }
  },
};
