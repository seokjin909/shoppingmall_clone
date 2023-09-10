import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, set, remove } from "firebase/database";
import { v4 as uuid } from "uuid";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

// 자동 로그인 해제 [ 로그인 시 매번 계정 선택 처리 ]
provider.setCustomParameters({
  prompt: "select_account",
});

export const login = () => {
  signInWithPopup(auth, provider).catch(console.error);
};

export const logout = () => {
  signOut(auth);
};

export const onUserStateChange = (callback) => {
  onAuthStateChanged(auth, async (user) => {
    const updateUser = user ? await adminUser(user) : null;
    callback(updateUser);
  });
};

// 관리자 계정 조회
const adminUser = async (user) => {
  return get(ref(database, "admins")) //
    .then((snapshot) => {
      if (snapshot.exists()) {
        const admins = snapshot.val();
        const isAdmin = admins.includes(user.uid);
        return { ...user, isAdmin };
      }
      return user;
    });
};

// 데이터 추가하기
export const addNewProduct = async (product, image) => {
  const id = uuid();
  return set(ref(database, `products/${id}`), {
    ...product,
    id,
    price: parseInt(product.price),
    image,
    options: product.options.split(","),
  });
};

// 데이터 불러오기
export const getProducts = async () => {
  return get(ref(database, "products")) //
    .then((snapshot) => {
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    });
};

export const getCart = async (userId) => {
  return get(ref(database, `carts/${userId}`)) //
    .then((snapshot) => {
      const itmes = snapshot.val() || {};
      return Object.values(itmes);
    });
};

export const addOrUpdateToCart = async (userId, product) => {
  return set(ref(database, `carts/${userId}/${product.id}`), product);
};

export const removeFromCart = async (userId, productId) => {
  return remove(ref(database, `carts/${userId}/${productId}`));
};
