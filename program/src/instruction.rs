use solana_program::program_error::ProgramError;
use crate::error::BlogError::InvalidInstruction;

pub enum BlogInstruction {

    /// Accounts expected:
    /// 
    /// 0. `[signer]` User account who is creating the blog
    /// 1. `[writable]` Blog account derived from PDA
    /// 2. `[]` The System Program
    InitBlog {},

    /// Accounts expected:
    /// 
    /// 0. `[signer]` User account who is creating the post
    /// 1. `[writable]` Blog account for which post is being created
    /// 2. `[writable]` Post account derived from PDA
    CreatePost {
        post_account_bump: u8,
        slug: String,
        title: String,
        content: String,
    }
}

impl BlogInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, _rest) = input.split_first().ok_or(InvalidInstruction)?;

        Ok(match tag {
            0 => Self::InitBlog {},
            _ => return Err(InvalidInstruction.into()),
        })
    }
}

