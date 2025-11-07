import React from 'react'

import { GraduateForm } from '../../../constants/type';

interface Props {
    form: GraduateForm;
    onChange: (patch: Partial<GraduateForm>) => void;
    onNext: () => void;
    onBack: () => void; 
  }

const RoleSelection: React.FC<Props> = () => {
  return (
    <div>RoleSelection</div>
  )
}

export default RoleSelection