import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

/**
 * Variantes do componente RadioGroup
 */
const radioGroupVariants = cva(
  'grid gap-2',
  {
    variants: {
      orientation: {
        horizontal: 'grid-flow-col auto-cols-fr',
        vertical: 'grid-cols-1',
      },
      size: {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
      size: 'md',
    },
  }
);

const radioItemVariants = cva(
  'relative flex items-center space-x-2 cursor-pointer group transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent/50 rounded-md p-2',
        card: 'border rounded-lg p-3 hover:border-primary/50 hover:bg-primary/5',
        minimal: '',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const radioButtonVariants = cva(
  'relative w-4 h-4 rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
  {
    variants: {
      state: {
        default: 'border-input bg-background hover:border-primary/50',
        checked: 'border-primary bg-primary',
        disabled: 'border-muted bg-muted cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends VariantProps<typeof radioGroupVariants> {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
  itemVariant?: 'default' | 'card' | 'minimal';
  error?: boolean;
  required?: boolean;
}

/**
 * Componente RadioGroup com microinterações avançadas
 * 
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { value: 'option1', label: 'Opção 1' },
 *     { value: 'option2', label: 'Opção 2', description: 'Descrição da opção 2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   orientation="horizontal"
 *   itemVariant="card"
 * />
 * ```
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      value,
      onChange,
      name,
      disabled = false,
      className,
      orientation,
      size,
      itemVariant = 'default',
      error = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const groupName = name || React.useId();

    const handleChange = (optionValue: string) => {
      if (!disabled && onChange) {
        onChange(optionValue);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          radioGroupVariants({ orientation, size }),
          error && 'ring-2 ring-destructive/20 rounded-md p-1',
          className
        )}
        role="radiogroup"
        aria-required={required}
        {...props}
      >
        {options.map((option) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;
          
          return (
            <label
              key={option.value}
              className={cn(
                radioItemVariants({ variant: itemVariant, size }),
                isDisabled && 'opacity-50 cursor-not-allowed',
                isChecked && itemVariant === 'card' && 'border-primary bg-primary/5',
                error && 'text-destructive'
              )}
            >
              <div className="relative">
                <input
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleChange(option.value)}
                  disabled={isDisabled}
                  className="sr-only"
                  aria-describedby={option.description ? `${option.value}-description` : undefined}
                />
                
                <div
                  className={cn(
                    radioButtonVariants({
                      state: isDisabled ? 'disabled' : isChecked ? 'checked' : 'default'
                    })
                  )}
                >
                  {/* Indicador interno quando selecionado */}
                  {isChecked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-scale-in" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <span className={cn(
                  'font-medium',
                  isChecked && 'text-primary',
                  error && 'text-destructive'
                )}>
                  {option.label}
                  {required && <span className="text-destructive ml-1">*</span>}
                </span>
                
                {option.description && (
                  <p
                    id={`${option.value}-description`}
                    className={cn(
                      'text-sm text-muted-foreground mt-1',
                      error && 'text-destructive/70'
                    )}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

/**
 * Componente RadioItem individual para uso customizado
 */
export interface RadioItemProps {
  value: string;
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
}

export const RadioItem = React.forwardRef<HTMLLabelElement, RadioItemProps>(
  (
    {
      value,
      label,
      description,
      checked = false,
      onChange,
      disabled = false,
      name,
      className,
      variant = 'default',
      size = 'md',
      error = false,
      ...props
    },
    ref
  ) => {
    const handleChange = () => {
      if (!disabled && onChange) {
        onChange(value);
      }
    };

    return (
      <label
        ref={ref}
        className={cn(
          radioItemVariants({ variant, size }),
          disabled && 'opacity-50 cursor-not-allowed',
          checked && variant === 'card' && 'border-primary bg-primary/5',
          error && 'text-destructive',
          className
        )}
        {...props}
      >
        <div className="relative">
          <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            aria-describedby={description ? `${value}-description` : undefined}
          />
          
          <div
            className={cn(
              radioButtonVariants({
                state: disabled ? 'disabled' : checked ? 'checked' : 'default'
              })
            )}
          >
            {checked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-scale-in" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <span className={cn(
            'font-medium',
            checked && 'text-primary',
            error && 'text-destructive'
          )}>
            {label}
          </span>
          
          {description && (
            <p
              id={`${value}-description`}
              className={cn(
                'text-sm text-muted-foreground mt-1',
                error && 'text-destructive/70'
              )}
            >
              {description}
            </p>
          )}
        </div>
      </label>
    );
  }
);

RadioItem.displayName = 'RadioItem';

export { radioGroupVariants, radioItemVariants, radioButtonVariants };