import React from 'react'
import { GraduateForm } from '../../../constants/type';

interface Props {
    form: GraduateForm;
    onChange: (patch: Partial<GraduateForm>) => void;
    onNext: () => void;

  }

const Personalnfo: React.FC<Props>  = ({ form, onChange, onNext }) => {
    return (
      <div className="flex items-center justify-center w-full flex-col gap-[30px] font-inter">
            <div className='flex flex-col gap-2.5 text-center'>
                <h2 className='font-semibold text-[32px] text-[#1C1C1C]'>
                Set up your profile
                </h2>
                <p className='font-normal text-[18px] text-[#1C1C1CBF]'>
                Tell us more about you
                </p>
            </div>

            <form className='flex flex-col gap-2.5 items-center justify-center  w-full'>
                <div className='w-full flex flex-col gap-[10px] max-w-[542px]'>
                    <label className='text-[#1C1C1CBF] text-[18px] font-normal' htmlFor="firstName">
                        First Name
                    </label>
                    <input type="text" placeholder='John' name='firstName' className='h-[62px] border-[1px]  border-[#C8D7EF] rounded-xl w-full px-2.5 p-5  bg-[#FFFFFF] text-[#1C1C1C33] font-normal'  value={form.firstName}  />
                </div>
                <div className='w-full flex flex-col gap-[10px] max-w-[542px]'>
                    <label className='text-[#1C1C1CBF] text-[18px] font-normal' htmlFor="lastName">
                        Last Name
                    </label>
                    <input type="text" name='lastName' placeholder='Doe' value={form.lastName} className='h-[62px] border-[1px] border-[#C8D7EF] rounded-xl w-full px-2.5 p-5  bg-[#FFFFFF] text-[#1C1C1C33] font-normal' />
                </div>
                <div className='w-full flex flex-col gap-[10px] max-w-[542px]'>
                    <label className='text-[#1C1C1CBF] text-[18px] font-normal' htmlFor="lastName">
                        Last Name
                    </label>
                    <input type="text" name='lastName' placeholder='Doe' value={form.lastName} className='h-[62px] border-[1px] border-[#C8D7EF] rounded-xl w-full px-2.5 p-5  bg-[#FFFFFF] text-[#1C1C1C33] font-normal' />
                </div>
                <div className='w-full flex flex-col gap-[10px] max-w-[542px]'>
                    <label className='text-[#1C1C1CBF] text-[18px] font-normal' htmlFor="lastName">
                        Last Name
                    </label>
                    <input type="text" name='lastName' placeholder='Doe' value={form.lastName} className='h-[62px] border-[1px] border-[#C8D7EF] rounded-xl w-full px-2.5 p-5  bg-[#FFFFFF] text-[#1C1C1C33] font-normal' />
                </div>
                <div className='w-full flex flex-col gap-[10px] max-w-[542px]'>
                    <label className='text-[#1C1C1CBF] text-[18px] font-normal' htmlFor="lastName">
                        Last Name
                    </label>
                    <input type="text" name='lastName' placeholder='Doe' value={form.lastName} className='h-[62px] border-[1px] border-[#C8D7EF] rounded-xl w-full px-2.5 p-5  bg-[#FFFFFF] text-[#1C1C1C33] font-normal' />
                </div>

            </form>
            <button     
            className="md:w-[400px] rounded-[10px] text-[16px] p-[18px] font-medium transition-all duration-200 bg-[#2E5EAA] text-[#F8F8F8] w-full"
              >Continue
            </button>
      </div>
    );
  };

export default Personalnfo