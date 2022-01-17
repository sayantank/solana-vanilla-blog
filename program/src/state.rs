use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Blog {
    pub authority: Pubkey,
    pub bump: u8,
    pub post_count: u8 // 10 posts max
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Post {
    pub author: Pubkey,
    pub blog: Pubkey,
    pub bump: u8,
    pub slug: String,
    pub title: String,
    pub content: String,
}

impl Blog {
    pub const LEN: usize = 32 + 1 + 1;
}

impl Post {
    pub const LEN: usize = 32 + 32 + 1 + 10 + 20 + 50;
}