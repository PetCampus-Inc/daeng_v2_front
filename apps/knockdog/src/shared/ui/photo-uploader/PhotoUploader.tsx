import { useUploader } from "@shared/lib";
import { ActionButton, Icon } from "@knockdog/ui";
import { MiniPhotoBox } from "./MiniPhotoBox";

interface PhotoUploaderProps {
  maxCount?: number;
}

function PhotoUploader({ maxCount = 3 }: PhotoUploaderProps) {
  const { files, state, open, removeFile, getInputProps } = useUploader({max: maxCount});

  return (
    <div>
      {/* 숨김 Input */}
      <input {...getInputProps()} hidden/>

      {/* 상태별 UI */}
      {state === "empty" ? (
        <ActionButton variant="secondaryLine" size="medium" onClick={open}>
          <Icon icon="Plus" className="size-x6" />
          사진등록</ActionButton>
      ) : (        
        <div className="flex gap-2">
          { state === "partial" &&  (<button onClick={open} type="button" className="border rounded-lg flex border-line-400 body2-regular text-text-tertiary py-5 h-[80px] w-[80px] flex-col items-center justify-center">
              <Icon icon="Plus" className="w-6 h-6" />
              {files.length} / {maxCount}
            </button>
          )}

        {files.map((file) => (
            <MiniPhotoBox key={file.id} imageUrl={file.previewUrl} className="h-[80px] w-[80px]" onRemove={() => removeFile(file.id)}/>
          ))}
        </div>
      )}

      

    </div>
  )
}

export { PhotoUploader };