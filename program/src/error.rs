use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum BlogError {
    #[error("Invalid Instruction")]
    InvalidInstruction,

    #[error("Invalid Blog Account")]
    InvalidBlogAccount,

    #[error("Account not Writable")]
    AccountNotWritable,
}

impl From<BlogError> for ProgramError {
    fn from(e: BlogError) -> Self {
        return ProgramError::Custom(e as u32);
    }
}