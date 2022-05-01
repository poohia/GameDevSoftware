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
  onChange: (value: AssertFileValueType) => void;
};
const DropzoneAssetFileComponent = (props: DropzoneAssetFileComponentProps) => {
  const { value: valueProps, onChange } = props;
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
      'image/*': ['.jpeg', '.png'],
      'video/*': ['.mp4', '.mkv'],
      'audio/*': ['.mp3'],
      'application/json': ['.json'],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFile((_: any) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
      });
    },
  });
  const style: any = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
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

  return (
    <Container fluid>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {isDragAccept && <p>All files will be accepted</p>}
        {isDragReject && <p>Some files will be rejected</p>}
        {!isDragActive && <p>Drop some files here ...</p>}
      </div>
      {file && (
        <aside>
          <h4>File</h4>
          <p>{file.name}</p>
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
        </aside>
      )}
    </Container>
  );
};

export default DropzoneAssetFileComponent;
