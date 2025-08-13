import { Icon } from "@knockdog/ui";

interface MiniPhotoBoxProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  onRemove?: () => void;
}

function MiniPhotoBox({ imageUrl, alt = "사진", className = "", onRemove }: MiniPhotoBoxProps) {

  return (
    <div className="relative">
      <div className={`rounded-lg overflow-hidden ${className}`}>
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
        <button onClick={onRemove} type="button" >
          <Icon icon="DeleteInput" className="absolute right-1 top-1 h-5 w-5 text-neutral-700" />
        </button>
    </div>
  );
}

export { MiniPhotoBox };