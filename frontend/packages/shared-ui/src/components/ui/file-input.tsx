import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Upload, X, File } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

/**
 * Variantes do componente FileInput
 */
const fileInputVariants = cva(
  'relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg transition-colors hover:bg-muted/50',
  {
    variants: {
      variant: {
        default: 'border-input hover:border-primary',
        error: 'border-destructive hover:border-destructive',
        success: 'border-green-500 hover:border-green-600',
      },
      size: {
        sm: 'h-24 p-4',
        md: 'h-32 p-6',
        lg: 'h-40 p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'>,
    VariantProps<typeof fileInputVariants> {
  /**
   * Callback quando arquivos são selecionados
   */
  onFileSelect?: (files: File[]) => void;
  /**
   * Arquivos atualmente selecionados
   */
  files?: File[];
  /**
   * Texto de erro a ser exibido
   */
  error?: string;
  /**
   * Texto de ajuda a ser exibido
   */
  helperText?: string;
  /**
   * Texto do placeholder
   */
  placeholder?: string;
  /**
   * Tamanho máximo do arquivo em bytes
   */
  maxSize?: number;
  /**
   * Tipos de arquivo aceitos
   */
  acceptedTypes?: string[];
  /**
   * Se permite múltiplos arquivos
   */
  multiple?: boolean;
  /**
   * Se está fazendo upload
   */
  uploading?: boolean;
  /**
   * Label do input
   */
  label?: string;
}

/**
 * Componente FileInput para upload de arquivos com drag & drop
 * 
 * @example
 * ```tsx
 * <FileInput
 *   label="Logo do Projeto"
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   onFileSelect={(files) => handleFileSelect(files)}
 *   error={errors.logo?.message}
 * />
 * ```
 */
const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      variant,
      size,
      onFileSelect,
      files = [],
      error,
      helperText,
      placeholder = 'Clique para selecionar ou arraste arquivos aqui',
      maxSize,
      acceptedTypes,
      multiple = false,
      uploading = false,
      label,
      accept,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const finalVariant = error ? 'error' : variant;

    // Combina ref externo com interno
    React.useImperativeHandle(ref, () => inputRef.current!);

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`;
      }
      
      if (acceptedTypes && acceptedTypes.length > 0) {
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        
        const isValidType = acceptedTypes.some(type => {
          if (type.includes('*')) {
            return fileType.startsWith(type.replace('*', ''));
          }
          return type === fileType || type === fileExtension;
        });
        
        if (!isValidType) {
          return `Tipo de arquivo não aceito. Aceitos: ${acceptedTypes.join(', ')}`;
        }
      }
      
      return null;
    };

    const handleFileChange = (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;
      
      const fileArray = Array.from(selectedFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      fileArray.forEach(file => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });
      
      if (errors.length > 0) {
        console.warn('Erros de validação:', errors);
      }
      
      if (validFiles.length > 0) {
        const filesToSelect = multiple ? validFiles : validFiles.slice(0, 1);
        onFileSelect?.(filesToSelect);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileChange(e.target.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !uploading) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      
      if (disabled || uploading) return;
      
      const droppedFiles = e.dataTransfer.files;
      handleFileChange(droppedFiles);
    };

    const handleClick = () => {
      if (!disabled && !uploading) {
        inputRef.current?.click();
      }
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onFileSelect?.(newFiles);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        
        <div
          className={cn(
            fileInputVariants({ variant: finalVariant, size }),
            isDragOver && 'border-primary bg-primary/5',
            (disabled || uploading) && 'opacity-50 cursor-not-allowed',
            !disabled && !uploading && 'cursor-pointer',
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept={accept}
            multiple={multiple}
            disabled={disabled || uploading}
            {...props}
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                <p className="text-sm text-muted-foreground">Fazendo upload...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  {placeholder}
                </p>
                {(maxSize || acceptedTypes) && (
                  <p className="text-xs text-muted-foreground">
                    {acceptedTypes && `Tipos: ${acceptedTypes.join(', ')}`}
                    {acceptedTypes && maxSize && ' • '}
                    {maxSize && `Máx: ${formatFileSize(maxSize)}`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Lista de arquivos selecionados */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Mensagens de erro ou ajuda */}
        {(error || helperText) && (
          <div className="text-xs">
            {error && (
              <p className="text-destructive">{error}</p>
            )}
            {!error && helperText && (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export { FileInput, fileInputVariants };