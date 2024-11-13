import React, { useState, useEffect } from "react";
import { Text, View, TextInput, Button, FlatList, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import FontAwesome from 'react-native-vector-icons/FontAwesome';


interface Contact {
  id?: string;
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchContacts();
  }, []);

  // Função para cadastrar ou atualizar contato
  const handleSubmit = async () => {
    if (!nome || !email || !telefone) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }

    const newContact: Contact = { nome, email, telefone };

    try {
      if (editingId) {
        // Atualizar contato
        const contactDoc = doc(db, "contacts", editingId);
        await updateDoc(contactDoc, newContact);
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === editingId ? { ...newContact, id: editingId } : contact
          )
        );
        setEditingId(null);
        Alert.alert("Sucesso", "Contato atualizado!");
      } else {
        // Adicionar novo contato
        const docRef = await addDoc(collection(db, "contacts"), newContact);
        setContacts((prevContacts) => [
          ...prevContacts,
          { ...newContact, id: docRef.id },
        ]);
        Alert.alert("Sucesso", "Contato cadastrado!");
      }

      // Limpar os campos
      setNome("");
      setEmail("");
      setTelefone("");
    } catch (error) {
      console.error("Erro ao salvar o contato:", error);
      Alert.alert("Erro", "Não foi possível salvar o contato.");
    }
  };

  // Função para deletar contato
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contacts", id));
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
      Alert.alert("Sucesso", "Contato deletado!");
    } catch (error) {
      console.error("Erro ao deletar contato:", error);
      Alert.alert("Erro", "Não foi possível deletar o contato.");
    }
  };

  // Função para editar contato
  const handleEdit = (contact: Contact) => {
    setNome(contact.nome);
    setEmail(contact.email);
    setTelefone(contact.telefone);
    setEditingId(contact.id || null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {editingId ? "Editar Contato" : "Formulário de Contato"}
      </Text>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
      />

      <Button title={editingId ? "Atualizar" : "Cadastrar"} onPress={handleSubmit} />

      <Text style={styles.listHeader}>Lista de Contatos:</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id ?? ""}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>{item.nome} - {item.email} - {item.telefone}</Text>
            <TouchableOpacity onPress={() => handleEdit(item)} >
              <FontAwesome name="pencil" size={15} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id!)}>
              <FontAwesome name="trash" size={15} color="black"/>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 30,
    marginBottom: 20,
    color: "#00317c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  listHeader: {
    fontSize: 18,
    marginTop: 30,
    color: "#00317c",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginRight: 10,
  },
  contactText: {
    flex: 1,
    marginRight:10,
  },
  editButton: {
    marginRight: 50 ,
    //marginLeft: 50,
  },
  deleteButton: {
    marginLeft: 50,
  //  marginRight: 50,
  },
});
