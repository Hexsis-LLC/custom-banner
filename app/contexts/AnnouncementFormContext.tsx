import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { FormState, ValidationState } from '../types/announcement-form';
import { validateAnnouncement } from '../schemas/announcement';
import { getErrorMessage } from '../utils/announcement-form';
import { ZodError } from 'zod';

type FormAction =
  | { type: 'UPDATE_SECTION'; section: keyof FormState; data: Partial<FormState[keyof FormState]> }
  | { type: 'RESET_VALIDATION' }
  | { type: 'SET_VALIDATION_ERRORS'; errors: string[] }
  | { type: 'SET_FIELD_ERRORS'; errors: ValidationState }
  | { type: 'SET_FORM_DATA'; data: FormState };

interface FormReducerState {
  formData: FormState;
  validationErrors: string[];
  fieldErrors: ValidationState;
}

interface FormContextType extends FormReducerState {
  handleFormChange: <T extends keyof FormState, K extends keyof FormState[T]>(
    section: T,
    data: { [P in K]: FormState[T][P] }
  ) => void;
  validateForm: () => boolean;
  hasError: (fieldPath: string) => boolean;
  getFieldErrorMessage: (fieldPath: string) => string;
  setFormData: (data: FormState) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

function formReducer(state: FormReducerState, action: FormAction): FormReducerState {
  switch (action.type) {
    case 'UPDATE_SECTION':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.section]: {
            ...state.formData[action.section],
            ...action.data,
          },
        },
      };
    case 'RESET_VALIDATION':
      return {
        ...state,
        validationErrors: [],
        fieldErrors: { errors: [], errorFields: new Set<string>() },
      };
    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.errors,
      };
    case 'SET_FIELD_ERRORS':
      return {
        ...state,
        fieldErrors: action.errors,
      };
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.data,
      };
    default:
      return state;
  }
}

export function FormProvider({ children, initialData }: { children: React.ReactNode; initialData: FormState }) {
  const [state, dispatch] = useReducer(formReducer, {
    formData: initialData,
    validationErrors: [],
    fieldErrors: { errors: [], errorFields: new Set<string>() },
  });

  const handleFormChange = useCallback(<T extends keyof FormState, K extends keyof FormState[T]>(
    section: T,
    data: { [P in K]: FormState[T][P] }
  ) => {
    dispatch({ type: 'UPDATE_SECTION', section, data });
    dispatch({ type: 'RESET_VALIDATION' });
  }, []);

  const setFormData = useCallback((data: FormState) => {
    dispatch({ type: 'SET_FORM_DATA', data });
  }, []);

  const validateForm = useCallback(() => {
    try {
      const dataToValidate = {
        ...state.formData,
        basic: {
          ...state.formData.basic,
          startDate: new Date(state.formData.basic.startDate),
          endDate: new Date(state.formData.basic.endDate),
        },
      };

      validateAnnouncement(dataToValidate);
      dispatch({ type: 'SET_FIELD_ERRORS', errors: { errors: [], errorFields: new Set<string>() } });
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => getErrorMessage(err));
        const groupedErrors = errorMessages.reduce((acc: { [key: string]: string[] }, message: string) => {
          const tabName = message.split(' in ')[1].split(' tab')[0];
          if (!acc[tabName]) acc[tabName] = [];
          acc[tabName].push(message.split(' in ')[0]);
          return acc;
        }, {});

        const formattedErrors = Object.entries(groupedErrors).map(([tab, errors]) =>
          `${tab} tab: ${errors.join(', ')}`
        );

        const errorFields = new Set<string>(error.errors.map((err) => err.path.join('.')));

        dispatch({
          type: 'SET_FIELD_ERRORS',
          errors: {
            errors: error.errors.map((err) => ({
              path: err.path,
              message: err.message,
            })),
            errorFields,
          },
        });

        dispatch({ type: 'SET_VALIDATION_ERRORS', errors: formattedErrors });
      }
      return false;
    }
  }, [state.formData]);

  const hasError = useCallback((fieldPath: string) => {
    return state.fieldErrors.errorFields.has(fieldPath);
  }, [state.fieldErrors.errorFields]);

  const getFieldErrorMessage = useCallback((fieldPath: string) => {
    const error = state.fieldErrors.errors.find(err => err.path.join('.') === fieldPath);
    return error ? error.message : '';
  }, [state.fieldErrors.errors]);

  const value = {
    ...state,
    handleFormChange,
    validateForm,
    hasError,
    getFieldErrorMessage,
    setFormData,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
