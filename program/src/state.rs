use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Blog {
    pub authority: Pubkey,
    pub bump: u8,
    pub post_count: u8 // 10 posts max
}

impl Blog {
    pub const LEN: usize = 32 + 1 + 1;
}