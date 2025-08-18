import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Variantes do Avatar usando CVA
 */
const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Container do Avatar
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
    VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * Imagem do Avatar
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Fallback do Avatar
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Props do UserAvatar
 */
export interface UserAvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Avatar>, 'children'>,
    VariantProps<typeof avatarVariants> {
  /**
   * URL da imagem do avatar
   */
  src?: string;
  /**
   * Texto alternativo da imagem
   */
  alt?: string;
  /**
   * Nome do usuário para gerar fallback
   */
  name?: string;
  /**
   * Fallback customizado
   */
  fallback?: string;
  /**
   * Se deve mostrar indicador online
   */
  showOnlineIndicator?: boolean;
  /**
   * Status online do usuário
   */
  isOnline?: boolean;
  /**
   * Se o avatar é clicável
   */
  clickable?: boolean;
}

/**
 * Gera iniciais a partir do nome
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Avatar de usuário com funcionalidades extras
 * 
 * @example
 * ```tsx
 * <UserAvatar 
 *   src="/avatar.jpg" 
 *   name="João Silva" 
 *   size="lg" 
 *   showOnlineIndicator 
 *   isOnline 
 * />
 * ```
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  name = '',
  fallback,
  showOnlineIndicator = false,
  isOnline = false,
  clickable = false,
  size = 'md',
  className,
  ...props
}) => {
  const displayFallback = fallback || getInitials(name) || '?';
  const displayAlt = alt || name || 'Avatar';

  const indicatorSizes: Record<NonNullable<typeof size>, string> = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  };

  return (
    <div className="relative inline-block">
      <Avatar
        size={size}
        className={cn(
          clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        {...props}
      >
        <AvatarImage src={src} alt={displayAlt} />
        <AvatarFallback>{displayFallback}</AvatarFallback>
      </Avatar>
      
      {showOnlineIndicator && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            size ? indicatorSizes[size] : indicatorSizes.md,
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

/**
 * Props do AvatarGroup
 */
export interface AvatarGroupProps {
  /**
   * Lista de avatares
   */
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  /**
   * Número máximo de avatares a exibir
   */
  max?: number;
  /**
   * Tamanho dos avatares
   */
  size?: VariantProps<typeof avatarVariants>['size'];
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Callback quando o grupo é clicado
   */
  onClick?: () => void;
}

/**
 * Grupo de avatares sobrepostos
 * 
 * @example
 * ```tsx
 * <AvatarGroup 
 *   avatars={[
 *     { src: '/user1.jpg', name: 'João' },
 *     { src: '/user2.jpg', name: 'Maria' },
 *     { name: 'Pedro' }
 *   ]}
 *   max={3}
 *   size="sm"
 * />
 * ```
 */
const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = 'md',
  className,
  onClick,
}) => {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div
      className={cn(
        'flex -space-x-2',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {displayAvatars.map((avatar, index) => (
        <UserAvatar
          key={index}
          {...(avatar.src && { src: avatar.src })}
          {...(avatar.name && { name: avatar.name })}
          {...(avatar.alt && { alt: avatar.alt })}
          size={size || 'md'}
          className="ring-2 ring-background"
        />
      ))}
      
      {remainingCount > 0 && (
        <Avatar size={size} className="ring-2 ring-background">
          <AvatarFallback className="bg-muted text-muted-foreground">
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

/**
 * Avatar com upload de imagem
 */
export interface UploadAvatarProps extends UserAvatarProps {
  /**
   * Callback quando uma nova imagem é selecionada
   */
  onImageSelect?: (file: File) => void;
  /**
   * Se está fazendo upload
   */
  uploading?: boolean;
  /**
   * Tipos de arquivo aceitos
   */
  accept?: string;
}

/**
 * Avatar com funcionalidade de upload
 * 
 * @example
 * ```tsx
 * <UploadAvatar 
 *   name="João Silva"
 *   onImageSelect={(file) => handleUpload(file)}
 *   uploading={isUploading}
 * />
 * ```
 */
const UploadAvatar: React.FC<UploadAvatarProps> = ({
  onImageSelect,
  uploading = false,
  accept = 'image/*',
  ...avatarProps
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!uploading && onImageSelect) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className="relative inline-block">
      <UserAvatar
        {...avatarProps}
        clickable={!!onImageSelect && !uploading}
        className={cn(
          onImageSelect && !uploading && 'hover:opacity-80',
          uploading && 'opacity-50',
          avatarProps.className
        )}
        onClick={handleClick}
      />
      
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
      
      {onImageSelect && (
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      )}
    </div>
  );
};

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserAvatar,
  AvatarGroup,
  UploadAvatar,
  avatarVariants,
};