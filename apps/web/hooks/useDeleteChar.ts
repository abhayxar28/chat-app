import axios from "axios";

type UseDeleteChatProps = { id: number };

export function useDeleteChat({id}: UseDeleteChatProps){
    const deleteChat = async () => {
    try {
      await axios(`http://localhost:3000/messsage/${id}`);
    } catch (e: any) {
      console.log
    }
  };

    return {deleteChat}
}