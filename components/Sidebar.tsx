import { signOut } from "firebase/auth"
import { auth, db } from "../config/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { useState } from "react"
import { addDoc, collection, query, where } from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"
import Tooltip from "@mui/material/Tooltip"
import Avatar from "@mui/material/Avatar"
import styled from "styled-components"
import IconButton from "@mui/material/IconButton"
import ChatIcon from "@mui/icons-material/Chat"
import MoreVerticalIcon from "@mui/icons-material/MoreVert"
import LogoutIcon from "@mui/icons-material/Logout"
import SearchIcon from "@mui/icons-material/Search"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import TextField from "@mui/material/TextField"
import DialogActions from "@mui/material/DialogActions"
import * as EmailValidator from "email-validator"
import { Conversation } from "../type"
import ConversationSelect from "./ConversationSelect"

const StyledContainer = styled.div`
    height: 100vh;
	min-width: 300px;
	max-width: 350px;
	overflow-y: scroll;
	border-right: 1px solid whitesmoke;
    
    /* Hide scrollbar for Chrome, Safari and Opera */
	::-webkit-scrollbar {
		display: none;
	}
	/* Hide scrollbar for IE, Edge and Firefox */
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */`
const StyledHeader = styled.div`
    display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	height: 80px;
	border-bottom: 1px solid whitesmoke;
	position: sticky;
	top: 0;
	background-color: white;
	z-index: 1;`
const StyledSearch = styled.div`
    display: flex;
	align-items: center;
	padding: 15px;
	border-radius: 2px;`
const StyledUserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }`
const StyledSearchIput = styled.input`
    outline: none;
	border: none;
	flex: 1;`
const StyledSidebarButton = styled(Button)`
	width: 100%;
	border-top: 1px solid whitesmoke;
	border-bottom: 1px solid whitesmoke;
`
const Sidebar = () => {
    const [loggedInUser, _loading, _error] = useAuthState(auth)
    const [isOpenNewConversationDialog, setisOpenNewConversationDialog] = useState(false)
    const [recipientEmail, setrecipientEmail] = useState('')

    const toggleNewConversationDialog = (isOpen: boolean) => {
        setisOpenNewConversationDialog(isOpen)

        if (!isOpen) { setrecipientEmail("") }
    }

    const closeNewConversationDialog = () => {
        toggleNewConversationDialog(false)
    }

    // Check if conversation already exists between the current logged in user and recipient
    const queryGetConversationsForCurrentUser = query(collection(db, "conversations"), where("users", "array-contains", loggedInUser?.email))
    const [conversationsSnapshot, __loading, __error] = useCollection(queryGetConversationsForCurrentUser)
    const isConversationAlreadyExists = (recipientEmail: string) =>
        conversationsSnapshot?.docs.find(conversation => (conversation.data() as Conversation).users.includes(recipientEmail))

    const isInvitingSelf = recipientEmail === loggedInUser?.email

    const createNewConversation = async () => {
        if (EmailValidator.validate(recipientEmail) && !isInvitingSelf && !isConversationAlreadyExists(recipientEmail)) {
            // add conversation user to db "conversations" collection
            // A conversation  is between  the curently logged in user and the user invited

            await addDoc(collection(db, "conversations"), {
                users: [loggedInUser?.email, recipientEmail]
            })
        }
        closeNewConversationDialog()
    }
    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.log("ERROR LOGGING OUT", error)
        }
    }
    return (
        <StyledContainer>
            <StyledHeader>
                <Tooltip title={loggedInUser?.email as string} placement="right">
                    <StyledUserAvatar src={loggedInUser?.photoURL || ""} alt="avatar" />
                </Tooltip>  
                <div>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVerticalIcon />
                    </IconButton>
                    <IconButton onClick={logout}>
                        <LogoutIcon />
                    </IconButton>
                </div>
            </StyledHeader>
            <StyledSearch>
                <SearchIcon />
                <StyledSearchIput placeholder="Search your conversations" />
            </StyledSearch>
            <StyledSidebarButton onClick={() => {
                toggleNewConversationDialog(true)
            }}>
                Start a new conversation
            </StyledSidebarButton>

            {/* List of conversations */}
            {conversationsSnapshot?.docs.map(conversation => 
                <ConversationSelect
                    key={conversation.id} 
                    id={conversation.id} 
                    conversationUsers={(conversation.data() as Conversation).users} 
                />
            )}

            <Dialog open={isOpenNewConversationDialog} onClose={closeNewConversationDialog}>
                <DialogTitle>New conversation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a Google email address for the user you wish to chat with
                    </DialogContentText>
                    <TextField
                        autoFocus
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={recipientEmail}
                        onChange={e => setrecipientEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeNewConversationDialog}>Cancel</Button>
                    <Button disabled={!recipientEmail} onClick={createNewConversation}>Create</Button>
                </DialogActions>
            </Dialog>
        </StyledContainer>
    )
}

export default Sidebar