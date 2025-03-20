/*
import { create } from 'zustand';
import { z } from 'zod';
import type { FormState, ValidationState } from '../types/announcement-form';
import { validateAnnouncement } from '../schemas/announcement';
import { getErrorMessage } from '../utils/announcement-form';
import { ZodError } from 'zod';
import { DEFAULT_INITIAL_DATA } from '../constants/announcement-form';

// Define the store schema with Zod
const FormStoreSchema = z.object({
  formData: z.any(), // Using any for formData since we don't have the exact type definition
  validationErrors: z.array(z.string()),
  fieldErrors: z.object({
    errors: z.array(z.object({
      path: z.array(z.union([z.string(), z.number()])),
      message: z.string()
    })).optional().default([]),
    errorFields: z.instanceof(Set).optional().default(new Set())
  })
});

type FormStore = z.infer<typeof FormStoreSchema>;

// Define the store actions
interface AnnouncementFormActions {
  // Update a section of the form
  handleFormChange: <T extends keyof FormState, K extends keyof FormState[T]>(
    section: T,
    data: { [P in K]: FormState[T][P] }
  ) => void;

  // Validate the entire form
  validateForm: () => boolean;

  // Check if a field has an error
  hasError: (fieldPath: string) => boolean;

  // Get error message for a field
  getFieldErrorMessage: (fieldPath: string) => string;

  // Set the entire form data
  setFormData: (data: FormState) => void;

  // Reset validation state
  resetValidation: () => void;

  // Set validation errors
  setValidationErrors: (errors: string[]) => void;

  // Set field errors
  setFieldErrors: (errors: ValidationState) => void;
}

// Combine the store state and actions
type AnnouncementFormStore = FormStore & AnnouncementFormActions;

// Create the store with a complete default form structure
export const useAnnouncementFormStore = create<AnnouncementFormStore>((set, get) => ({
  // Initialize with a complete form structure based on DEFAULT_INITIAL_DATA
  // This ensures all form sections exist even before explicit initialization
  formData: DEFAULT_INITIAL_DATA,
  validationErrors: [],
  fieldErrors: {
    errors: [],
    errorFields: new Set<string>()
  },

  // Action to handle form changes
  handleFormChange: <T extends keyof FormState, K extends keyof FormState[T]>(
    section: T,
    data: { [P in K]: FormState[T][P] }
  ) => {
    // Use a single state update to prevent multiple renders
    set(state => ({
      formData: {
        ...state.formData,
        [section]: {
          ...state.formData[section],
          ...data,
        },
      },
      // Reset validation inline instead of calling another state setter
      validationErrors: [],
      fieldErrors: { errors: [], errorFields: new Set<string>() }
    }));
  },

  // Reset validation state
  resetValidation: () => {
    set({
      validationErrors: [],
      fieldErrors: { errors: [], errorFields: new Set<string>() },
    });
  },

  // Set validation errors
  setValidationErrors: (errors: string[]) => {
    set({ validationErrors: errors });
  },

  // Set field errors
  setFieldErrors: (errors: ValidationState) => {
    set({ fieldErrors: errors });
  },

  // Validate the form
  validateForm: () => {
    try {
      const { formData } = get();

      // Ensure formData has all required sections before validation
      if (!formData || !formData.basic || !formData.text || !formData.cta ||
          !formData.background || !formData.other) {
        console.error('Form data is incomplete, cannot validate');
        return false;
      }

      const dataToValidate = {
        ...formData,
        basic: {
          ...formData.basic,
          startDate: formData.basic.startDate ? new Date(formData.basic.startDate) : new Date(),
          endDate: formData.basic.endDate ? new Date(formData.basic.endDate) : new Date(),
        },
      };

      validateAnnouncement(dataToValidate);

      // Use a single state update instead of multiple calls
      set({
        fieldErrors: { errors: [], errorFields: new Set<string>() }
      });

      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => getErrorMessage(err));
        const groupedErrors = errorMessages.reduce((acc: { [key: string]: string[] }, message: string) => {
          const tabName = message.split(' in ')[1]?.split(' tab')[0] || 'Unknown';
          if (!acc[tabName]) acc[tabName] = [];
          acc[tabName].push(message.split(' in ')[0]);
          return acc;
        }, {});

        const formattedErrors = Object.entries(groupedErrors).map(([tab, errors]) =>
          `${tab} tab: ${errors.join(', ')}`
        );

        const errorFields = new Set<string>(error.errors.map((err) => err.path.join('.')));

        // Use a single state update for error handling
        set({
          fieldErrors: {
            errors: error.errors.map((err) => ({
              path: err.path,
              message: err.message,
            })),
            errorFields,
          },
          validationErrors: formattedErrors
        });
      }
      return false;
    }
  },

  // Check if a field has an error
  hasError: (fieldPath: string) => {
    return get().fieldErrors.errorFields.has(fieldPath);
  },

  // Get error message for a field
  getFieldErrorMessage: (fieldPath: string) => {
    const error = get().fieldErrors.errors.find(err => err.path.join('.') === fieldPath);
    return error ? error.message : '';
  },

  // Set the entire form data
  setFormData: (data: FormState) => {
    // Ensure all sections exist when setting form data
    const completeData = {
      ...DEFAULT_INITIAL_DATA,
      ...data,
      basic: { ...DEFAULT_INITIAL_DATA.basic, ...data.basic },
      text: { ...DEFAULT_INITIAL_DATA.text, ...data.text },
      cta: { ...DEFAULT_INITIAL_DATA.cta, ...data.cta },
      background: { ...DEFAULT_INITIAL_DATA.background, ...data.background },
      other: { ...DEFAULT_INITIAL_DATA.other, ...data.other },
    };

    set({ formData: completeData });
  }
}));

// Initialize the store with data
export const initializeFormStore = (initialData: FormState) => {
  // Ensure all required sections are present by merging with defaults
  const completeData = {
    ...DEFAULT_INITIAL_DATA,
    ...initialData,
    basic: { ...DEFAULT_INITIAL_DATA.basic, ...initialData.basic },
    text: { ...DEFAULT_INITIAL_DATA.text, ...initialData.text },
    cta: { ...DEFAULT_INITIAL_DATA.cta, ...initialData.cta },
    background: { ...DEFAULT_INITIAL_DATA.background, ...initialData.background },
    other: { ...DEFAULT_INITIAL_DATA.other, ...initialData.other },
  };

  useAnnouncementFormStore.setState({
    formData: completeData,
    validationErrors: [],
    fieldErrors: { errors: [], errorFields: new Set<string>() }
  });
};
*/
