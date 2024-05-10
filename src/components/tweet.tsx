import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useState } from "react";

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(tweet);
  const [fileEdit, setFileEdit] = useState<File | null>(null);
  const user = auth.currentUser;

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweets?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fileDelete = async () => {
    if (user?.uid !== userId) return;
    if (fileEdit) {
      setFileEdit(null);
    }
    try {
      const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
      await deleteObject(photoRef);
      await updateDoc(doc(db, "tweets", id), {
        photo: deleteField(),
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEdit(e.target.value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files[0].size > 1 * 1024 * 1024) {
      confirm("Your file size is over 1MB!");
      return;
    }

    if (files && files.length === 1) {
      setFileEdit(files[0]);
    }
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const document = doc(db, "tweets", id);

      await updateDoc(document, {
        tweet: edit,
      });

      if (fileEdit) {
        //Reference 생성 (ref)
        const locationRef = ref(storage, `tweets/${user?.uid}/${document.id}`);

        //Cloud Storage에 업로드
        const result = await uploadBytes(locationRef, fileEdit);

        //URL을 통해 데이터 다운로드
        const url = await getDownloadURL(result.ref);
        await updateDoc(document, {
          photo: url,
        });
      }

      setFileEdit(null);
      setIsEdit(false);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Wrapper>
        <Column>
          <span className="user-name">{username}</span>
          {isEdit ? (
            <TextArea
              required
              rows={5}
              maxLength={180}
              onChange={onChange}
              value={edit}
            />
          ) : (
            <p>{tweet}</p>
          )}

          {user?.uid === userId ? (
            <>
              <Button className="del" onClick={onDelete}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </Button>
              {isEdit ? (
                <Button className="submit" onClick={onSubmit}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </Button>
              ) : (
                <Button className="edit" onClick={() => setIsEdit(true)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                  </svg>
                </Button>
              )}
            </>
          ) : null}
        </Column>

        {isEdit ? (
          <div className="photo-wrap edit">
            {photo ? (
              <>
                {fileEdit ? (
                  <p className="file-name">{fileEdit?.name}</p>
                ) : (
                  <img src={photo} />
                )}

                <label htmlFor="fileEdit" className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                  </svg>
                </label>
                <input
                  onChange={onFileChange}
                  type="file"
                  id="fileEdit"
                  accept="image/*"
                />
                <Button className="del icon" onClick={fileDelete}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </>
            ) : (
              <>
                <label htmlFor="fileAdd" className="add">
                  {fileEdit ? (
                    <p className="file-name">{fileEdit?.name}</p>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  )}
                </label>
                <input
                  onChange={onFileChange}
                  type="file"
                  id="fileAdd"
                  accept="image/*"
                />
                {fileEdit && (
                  <Button
                    className="del icon"
                    onClick={() => setFileEdit(null)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <>{photo ? <img src={photo} /> : null}</>
        )}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  font-size: 18px;

  svg {
    width: 20px;
    stroke-width: 2.5;
    vertical-align: middle;
  }

  input {
    display: none;
  }
  /* user name */
  .user-name {
    display: block;
    font-weight: 600;
    font-size: 14px;
    font-weight: normal;
    margin-bottom: 10px;
  }

  /* photo */
  img {
    width: 100%;
  }

  .photo-wrap {
    position: relative;
    align-self: flex-start;
    justify-self: end;
    text-align: right;
    width: 114px;
    height: 114px;
    border-radius: 10px;
    overflow: hidden;

    &.edit {
      margin-top: 24px;
      border-radius: 20px;
      border: 1px solid #808080;
      color: #1d9bf0;
      text-align: center;
      align-content: center;

      .icon {
        background-color: rgba(0, 0, 0, 0.7);
        padding: 2px;
        border-radius: 50%;
        position: absolute;
        left: auto;
        right: 4px;
        bottom: 6px;
        line-height: 1;
        font-size: 0;

        &.del {
          bottom: auto;
          top: 4px;
        }
      }

      svg {
        width: 12px;
        color: white;
      }
    }
  }

  .file-name {
    font-size: 11px;
    width: 100%;
    padding: 0 5%;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-word;

    display: -webkit-box;
    line-height: 1.2;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  /* file input */
  label {
    display: flex;
    color: #1d9bf0;
    text-align: center;
    cursor: pointer;

    &.add {
      border-radius: 20px;
      border: 1px solid #808080;
      height: 100%;
      justify-content: center;
      align-items: center;
      svg {
        width: 20px !important;
        color: #808080 !important;
      }
    }
  }
`;

const Column = styled.div`
  position: relative;
  padding-bottom: 40px;
`;

const Button = styled.button`
  background-color: unset;
  border: 0;
  position: absolute;
  left: 0;
  bottom: 0;
  color: #1d9bf0;

  cursor: pointer;

  &:nth-of-type(2) {
    left: 30px;
  }

  &.del {
    color: tomato;
  }
`;

const TextArea = styled.textarea`
  border: 1px solid #1d9bf0;
  padding: 10px;
  border-radius: 10px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
