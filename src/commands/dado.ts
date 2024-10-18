import { GroupMetadata } from "@whiskeysockets/baileys";
import path from "path";

import { StickerBotCommand } from "../types/Command";
import { WAMessageExtended } from "../types/Message";
import { sendMessage } from "../utils/baileysHelper";
import { checkCommand } from "../utils/commandValidator";
import { capitalize, spintax } from "../utils/misc";

// Gets the extension of this file, to dynamically import '.ts' if in development and '.js' if in production
const extension = __filename.endsWith(".js") ? ".js" : ".ts";

// Gets the file name without the .ts/.js extension
const commandName = capitalize(path.basename(__filename, extension));

// Command settings:
export const command: StickerBotCommand = {
  name: commandName,
  aliases: ["dado", "roll"],
  desc: "Rola um dado",
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

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const response = `🎲 Você rolou um *${diceRoll}*!`;

    return await sendMessage({ text: spintax(response) }, message);
  },
};
