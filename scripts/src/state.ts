import { PublicKey } from "@solana/web3.js";
import * as borsh from "@project-serum/borsh";

export interface BlogLayout {
  authorityPubkey: PublicKey;
  bump: number;
  postCount: number;
}

export interface PostLayout {
  slug: string;
  title: string;
  content: string;
}

export const BLOG_ACCOUNT_DATA_LAYOUT = borsh.struct([
  borsh.publicKey("authorityPubkey"),
  borsh.u8("bump"),
  borsh.u8("postCount"),
]);

export const POST_ACCOUNT_DATA_LAYOUT = borsh.struct([
  borsh.publicKey("author"),
  borsh.publicKey("blog"),
  borsh.u8("bump"),
  borsh.str("slug"),
  borsh.str("title"),
  borsh.str("content"),
]);

export const IX_DATA_LAYOUT = borsh.struct([
  borsh.u8("variant"),
  borsh.str("slug"),
  borsh.str("title"),
  borsh.str("content"),
]);
