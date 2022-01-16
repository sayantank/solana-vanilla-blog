import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import * as BufferLayout from "buffer-layout";

const PROGRAM_ID: PublicKey = new PublicKey(
  "2vqRh9BfyvR5h11KuvmscuBEcAuHNnKTMeQpZHCTqAga"
);

const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
};

export interface BlogLayout {
  authorityPubkey: Uint8Array;
  bump: number;
  postCount: number;
}

export const BLOG_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  publicKey("authorityPubkey"),
  BufferLayout.u8("bump"),
  BufferLayout.u8("postCount"),
]);

const main = async () => {
  const connection = new Connection("http://localhost:8899", "confirmed");

  const user = Keypair.generate();
  console.log("User: ", user.publicKey.toBase58());

  const airdropSig = await connection.requestAirdrop(
    user.publicKey,
    5 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);

  const [blogAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("blog"), user.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const initBlogIx = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: user.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: blogAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(Uint8Array.of(0)),
  });

  const tx = new Transaction().add(initBlogIx);
  const sig = await connection.sendTransaction(tx, [user], {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(sig);

  const blogAccountInfo = await connection.getAccountInfo(blogAccount);
  const blogAccountState = BLOG_ACCOUNT_DATA_LAYOUT.decode(
    blogAccountInfo.data
  ) as BlogLayout;

  console.log("decoded: ", blogAccountState);

  console.log(
    "authority: ",
    new PublicKey(blogAccountState.authorityPubkey).toBase58()
  );
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

runMain();
