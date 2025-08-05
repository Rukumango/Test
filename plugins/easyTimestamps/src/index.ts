import { registerCommand } from "@vendetta/commands";

let unregister: () => void;

const plugin = {
  onLoad() {
    unregister = registerCommand({
      name: "time",
      displayName: "Time",
      displayDescription: "Get a Discord‐formatted timestamp",
      description: "Get a Discord‐formatted timestamp",
      options: [
        {
          name: "time",
          description: "The time or offset to format (e.g. 3pm, 14:05, +5, +4:35)",
          type: 3,
          required: true,
        },
        {
          name: "style",
          description: "Format style: t/T/d/D/f/F/R (or aliases: st/lt/sd/ld/sdt/ldt/rel)",
          type: 3,
          required: false,
        },
      ],
      execute: this.executeCommand.bind(this),
      applicationId: "-1",
      inputType: 1,
      type: 1,
    });
  },

  onUnload() {
    unregister?.();
  },

  async executeCommand(args: any[]): Promise<{ content: string }> {
    const timeInput = args[0].value as string;
    const styleInput = (args[1]?.value as string)?.toLowerCase();

    let date = new Date();
    let ts: number;

    // offset parsing…
    const off = timeInput.match(/^([+-])(\d+)(?::(\d+))?$/);
    if (off) {
      const sign = off[1] === "-" ? -1 : 1;
      const h = parseInt(off[2], 10);
      const m = parseInt(off[3] ?? "0", 10);
      date.setHours(date.getHours() + sign * h);
      date.setMinutes(date.getMinutes() + sign * m);
      ts = Math.floor(date.getTime() / 1000);
    } else {
      // clock‐time parsing…
      const tm = timeInput.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/i);
      if (!tm) {
        return { content: "Provide a valid time (e.g. `3pm`, `14:05`) or offset (`+5`, `-2:30`)." };
      }
      let h = parseInt(tm[1], 10);
      const mm = parseInt(tm[2] ?? "0", 10);
      const ampm = tm[3]?.toLowerCase();
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      date.setHours(h, mm, 0, 0);
      ts = Math.floor(date.getTime() / 1000);
    }

    // style lookup…
    const styleMap: Record<string,string> = {
      t: "t", T: "T", d: "d", D: "D", f: "f", F: "F", R: "R",
      st: "t", lt: "T", sd: "d", ld: "D", sdt: "f", ldt: "F", rel: "R",
    };
    let fmt = "t";
    if (styleInput) {
      const code = styleMap[styleInput];
      if (!code) {
        return { content: "Invalid style: use `t/T/d/D/f/F/R` or `st/lt/sd/ld/sdt/ldt/rel`." };
      }
      fmt = code;
    }

    return { content: `<t:${ts}:${fmt}>` };
  },
};

export default plugin;
