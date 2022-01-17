// ignore

import * as borsh from "@project-serum/borsh";
import { Structure } from "@solana/buffer-layout";

const main = () => {
  const b = Buffer.alloc(100);
  const layout = borsh.struct([borsh.str("world")]) as Structure<{
    world: string;
  }>;
  layout.encode({ world: "world" }, b);
  console.log(b);
  console.log(layout.getSpan(b));
  console.log(layout.decode(b));
};

main();
