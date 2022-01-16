
use std::convert::TryInto;
use crate::{
    state::Blog, 
    instruction::BlogInstruction, 
    error::BlogError::{
        InvalidInstruction,
        InvalidBlogAccount
    }
};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    system_instruction,
    program::invoke_signed,
    pubkey::Pubkey,
    account_info::{AccountInfo, next_account_info},
    msg,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    sysvar::{rent::Rent, Sysvar}
};

pub struct Processor;
impl Processor {
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
        let instruction = BlogInstruction::unpack(instruction_data)?;

        match instruction {
            BlogInstruction::InitBlog {} => {
                msg!("Instruction: InitBlog");
                Self::process_init_blog(accounts, program_id)
            }
            _ => return Err(InvalidInstruction.into())
        }
    }

    fn process_init_blog(
        accounts: &[AccountInfo],
        program_id: &Pubkey
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        let authority_account = next_account_info(account_info_iter)?;
        let blog_account = next_account_info(account_info_iter)?;
        let system_program = next_account_info(account_info_iter)?;

        if !authority_account.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let (blog_pda, blog_bump) = Pubkey::find_program_address(&[b"blog".as_ref(), authority_account.key.as_ref()], program_id);
        if blog_pda != *blog_account.key {
            return Err(InvalidBlogAccount.into())
        }

        let rent = Rent::get()?;
        let rent_lamports = rent.minimum_balance(Blog::LEN);
        
        let create_pda_ix = &system_instruction::create_account(
            authority_account.key,
            blog_account.key,
            rent_lamports,
            Blog::LEN.try_into().unwrap(),
            program_id
        );
        msg!("Creating blog account!");
        invoke_signed(
            create_pda_ix, 
            &[
                authority_account.clone(),
                blog_account.clone(),
                system_program.clone()
            ],
            &[&[
                b"blog".as_ref(),
                authority_account.key.as_ref(),
                &[blog_bump]
            ]]
        )?;

        msg!("Updating blog account state!");
        let mut blog_account_state = Blog::try_from_slice(&blog_account.data.borrow())?;
        blog_account_state.authority = *authority_account.key;
        blog_account_state.bump = blog_bump;
        blog_account_state.post_count = 0;
        blog_account_state.serialize(&mut &mut blog_account.data.borrow_mut()[..])?;
        

        Ok(())
    }
}