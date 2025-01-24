import React from 'react';
import radio_inactive from "../assets/svg/radio_inactive.svg";
import radio_active from "../assets/svg/radio_active.svg";
interface StepIndicatorProps {
  selected: boolean;
  completed?: boolean;
  disabled?: boolean;
}

export function StepIndicator({selected}: StepIndicatorProps) {
  const size = 16; // Fixed size to match radio button


  return (
    <>
      {selected&& (
        <div style={{ display: 'flex', justifyContent: 'center', justifyItems: 'center', paddingTop: '2px' }}>
          <img src={radio_active} width={size} height={size} alt="selected radio" />
        </div>
      )}
      {!selected && (
        <div style={{ display: 'flex', justifyContent: 'center', justifyItems: 'center', paddingTop: '2px' }}>
          <img src={radio_inactive} width={size} height={size} alt="selected radio" />
        </div>
      )}
    </>
  );
}

