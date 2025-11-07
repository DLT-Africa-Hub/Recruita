import React from 'react'
import { GraduateForm } from '../../../constants/type';

interface Props {
    form: GraduateForm;
    onChange: (patch: Partial<GraduateForm>) => void;
    onBack: () => void; 
  }

const SkillSelection: React.FC<Props> = () => {
  return (
    <div>SkillSelection</div>
  )
}

export default SkillSelection