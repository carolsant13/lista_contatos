import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Button, FlatList, Alert } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

interface Contact {
  id?: string; // Para armazenar o ID do documento do Firestore
  nome: string;
  email: string;
  telefone: string;
}

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCC3z2SsN2xx6nIijLU1qbdD2J7NibijtY",
  authDomain: "projetocrud-3be0e.firebaseapp.com",
  projectId: "projetocrud-3be0e",
  storageBucket: "projetocrud-3be0e.appspot.com",
  messagingSenderId: "969290275668",
  appId: "1:969290275668:web:1479a9081fde79e15f46c1",
};

// Inicializa o Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Função para carregar contatos do Firestore
  const fetchContacts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "contacts"));
      const loadedContacts: Contact[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      setContacts(loadedContacts);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    }
  };

  // Carregar contatos ao montar o componente
  useEffect(() => {
    fetchContacts();
  }, []);

  // Função para cadastrar novo contato
  const handleSubmit = async () => {
    if (!nome || !email || !telefone) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }

    const newContact: Contact = { nome, email, telefone };

    try {
      // Salva o novo contato no Firestore
      const docRef = await addDoc(collection(db, "contacts"), newContact);
      console.log("Contato salvo no Firestore!");

      // Atualiza a lista de contatos localmente
      setContacts((prevContacts) => [
        ...prevContacts,
        { ...newContact, id: docRef.id },
      ]);

      // Limpa os campos do formulário
      setNome("");
      setEmail("");
      setTelefone("");
    } catch (error) {
      console.error("Erro ao salvar o contato:", error);
      Alert.alert("Erro", "Não foi possível salvar o contato.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Formulário de Contato</Text>

      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, width: "100%" }}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
      />
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, width: "100%" }}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu email"
        keyboardType="email-address"
      />
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, width: "100%" }}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
      />

      <Button title="Cadastrar" onPress={handleSubmit} />

      <Text style={{ fontSize: 18, marginTop: 30 }}>Lista de Contatos:</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id ?? ""}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", padding: 5 }}>
            <Text>{item.nome} - {item.email} - {item.telefone}</Text>
          </View>
        )}
      />
    </View>
  );
}
