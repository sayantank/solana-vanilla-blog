import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  BLOG_ACCOUNT_DATA_LAYOUT,
  IX_DATA_LAYOUT,
  POST_ACCOUNT_DATA_LAYOUT,
} from "./state";

const PROGRAM_ID: PublicKey = new PublicKey(
  "2vqRh9BfyvR5h11KuvmscuBEcAuHNnKTMeQpZHCTqAga"
);

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

  const InitBlogPayload = {
    variant: 0,
  };
  const blogBuffer = Buffer.alloc(1000);
  IX_DATA_LAYOUT.encode(InitBlogPayload, blogBuffer);
  const InitBlogData = blogBuffer.slice(0, IX_DATA_LAYOUT.getSpan(blogBuffer));

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
    data: InitBlogData,
  });

  const [postAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("post"), Buffer.from("slug-1"), user.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const postIxPayload = {
    variant: 1,
    slug: "slug-1",
    title: "title-1",
    content: "content-1",
  };
  const postBuffer = Buffer.alloc(1000);
  IX_DATA_LAYOUT.encode(postIxPayload, postBuffer);
  const postIxData = postBuffer.slice(0, IX_DATA_LAYOUT.getSpan(postBuffer));

  const createPostIx = new TransactionInstruction({
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
        pubkey: postAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: postIxData,
  });

  const tx = new Transaction();
  tx.add(initBlogIx);
  tx.add(createPostIx);

  const sig = await connection.sendTransaction(tx, [user], {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(sig);

  const blogAccountInfo = await connection.getAccountInfo(blogAccount);
  const blogAccountState = BLOG_ACCOUNT_DATA_LAYOUT.decode(
    blogAccountInfo.data
  );
  console.log("Blog account state: ", blogAccountState);

  const postAccountInfo = await connection.getAccountInfo(postAccount);
  const postAccountState = POST_ACCOUNT_DATA_LAYOUT.decode(
    postAccountInfo.data
  );
  console.log("Post account state: ", postAccountState);
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
