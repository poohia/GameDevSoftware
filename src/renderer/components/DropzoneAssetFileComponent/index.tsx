import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container } from 'semantic-ui-react';
import { AssertAcceptedType, AssertFileValueType } from 'types';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};
type FileType = File & { preview: string };
type DropzoneAssetFileComponentProps = {
  value?: AssertFileValueType;
  disabled: boolean;
  onChange: (value: AssertFileValueType) => void;
};
const DropzoneAssetFileComponent = (props: DropzoneAssetFileComponentProps) => {
  const { value: valueProps, disabled, onChange } = props;
  const [file, setFile] = useState<FileType | undefined>();
  const [value, setValue] = useState<AssertFileValueType | undefined>(
    valueProps
  );
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
  } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mkv'],
      'audio/*': ['.mp3'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFile((_: any) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
      });
    },
    disabled,
  });
  const style: any = useMemo(
    () => ({
      ...baseStyle,
      ...focusedStyle,
      // ...(isFocused ? focusedStyle : {}),
      // ...(isDragAccept ? acceptStyle : {}),
      // ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );
  const formatTypeFile = useCallback((fileType: string): AssertAcceptedType => {
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('video')) return 'video';
    if (fileType.includes('audio')) return 'sound';
    if (fileType === 'application/json') return 'json';
    return 'image';
  }, []);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target) {
        setValue({
          fileName: file.name,
          fileType: formatTypeFile(file.type),
          content: e.target.result,
        });
      }
    };
    if (file.type === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    if (value) {
      onChange(value);
    }
  }, [value]);

  console.log(isDragAccept, isDragReject);

  return (
    <Container fluid className="game-dev-software-file-preview-container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} disabled={disabled} />
        {/* {isDragAccept && <p>File will be accepted</p>}
        {isDragReject && <p>File will be rejected</p>} */}
        {/* {!isDragActive && <p>Drop file here ...</p>} */}
        <p>Drop file here ...</p>
      </div>
      {file && (
        <aside>
          <h4>File</h4>
          <p>{file.name}</p>
          <div className="game-dev-software-file-preview-content">
            {file.type.includes('image') && (
              <img
                src={file.preview}
                // Revoke data uri after image is loaded
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
              />
            )}
            {file.type.includes('video') && (
              <video
                width="320"
                height="240"
                controls
                src={file.preview}
                // Revoke data uri after image is loaded
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
              />
            )}
            {file.type.includes('audio') && (
              <audio
                controls
                src={file.preview}
                // Revoke data uri after image is loaded
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
              />
            )}
            {file.type === 'application/json' &&
              value &&
              value.fileType === 'json' && <code>{value.content}</code>}
          </div>
        </aside>
      )}
    </Container>
  );
};

export default DropzoneAssetFileComponent;
