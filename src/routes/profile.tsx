import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState(user?.displayName);
  const onAvatarChange = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if(!user) return;
    if(files && files.length === 1){
      const file = files[0];

      const locationRef = ref(storage, `avatars/${user?.uid}`); // 파일저장위치 선택
      const result = await uploadBytes(locationRef, file); // storage 저장
      const avatarUrl = await getDownloadURL(result.ref); // 이미지 url 받아옴

      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      // 데이터 필터링
      collection(db, "tweets"),
      where("userId", "==", user?.uid), // doc의 field, 연산자, 조건
      orderBy("createdAt", "desc"), // 정렬옵션
      limit(25) // 갯수옵션
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map(doc => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };

  useEffect(() => {
    fetchTweets();
  },[]);
  
  const onNameChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const onsubmit = async () => {
    try {
       if (!user) return;
       await updateProfile(user, {
         displayName: name,
       });
       
      setIsEdit(false);
    } catch (e) {
      console.log(e);
    }
  };
  
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
          </svg>
        )}
        <span className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
          </svg>
        </span>
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      {isEdit ? (
        <Name>
          <label htmlFor="nam"></label>
          <AvatarName
            id="name"
            type="text"
            value={name ?? ""}
            onChange={onNameChange}
          />
          <Button onClick={onsubmit}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </Button>
        </Name>
      ) : (
        <Name>
          <p>{user?.displayName ?? "Anonymous"}</p>
          <Button onClick={() => setIsEdit(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
            </svg>
          </Button>
        </Name>
      )}

      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const AvatarUpload = styled.label`
  position: relative;
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 50px;
  }

  .icon {display:none;}
  
  &:hover .icon {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    line-height: 80px;
    text-align: center;
    background-color: rgba(0,0,0,0.7);

    svg {
      width: 20px;
    }
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Name = styled.span`
  font-size: 22px;
  display: flex;
  gap: 10px;
`;

const Tweets = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AvatarName = styled.input`
  border: 1px solid #1d9bf0;
  padding: 10px;
  border-radius: 10px;
  font-size: 16px;
  color: white;
  background-color: black;
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const Button = styled.button`
  background-color: unset;
  border: 0;
  padding: 0;
  margin: 0;
  color: #1d9bf0;
  cursor: pointer;

  svg {
    width: 14px;
    vertical-align: middle;
  }
`;