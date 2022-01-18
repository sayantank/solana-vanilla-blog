use borsh::{BorshDeserialize};
use solana_program::{program_error::ProgramError};
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
    /// 3. `[]` System Program
    CreatePost {
        slug: String,
        title: String,
        content: String,
    }
}

#[derive(BorshDeserialize, Debug)]
struct PostIxPayload {
    slug: String,
    title: String,
    content: String
}


impl BlogInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (variant, rest) = input.split_first().ok_or(InvalidInstruction)?;
        let payload = PostIxPayload::try_from_slice(rest).unwrap();

        Ok(match variant {
            0 => Self::InitBlog {},
            1 => Self::CreatePost {
                slug: payload.slug,
                title: payload.title,
                content: payload.content
            },
            _ => return Err(InvalidInstruction.into()),
        })
    }
}

