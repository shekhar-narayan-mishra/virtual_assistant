import uploadOnCloudinary from "../config/cloudinary.js"
import groqResponse from "../grok.js"
import User from "../models/user.model.js"
import moment from "moment"

export const askToAssistantGuest = async (req, res) => {
   try {
      const { command } = req.body
      const userName = "Guest"
      const assistantName = "Jarvis" // Default for guest

      const result = await groqResponse(command, assistantName, userName)

      const jsonMatch = result.match(/{[\s\S]*}/)
      if (!jsonMatch) {
         return res.status(400).json({ response: "sorry, i can't understand" })
      }
      const gemResult = JSON.parse(jsonMatch[0])
      console.log(gemResult)
      const type = gemResult.type

      let aiResponse = "";

      switch (type) {
         case 'get-date':
            aiResponse = `current date is ${moment().format("YYYY-MM-DD")}`;
            break;
         case 'get-time':
            aiResponse = `current time is ${moment().format("hh:mm A")}`;
            break;
         case 'get-day':
            aiResponse = `today is ${moment().format("dddd")}`;
            break;
         case 'get-month':
            aiResponse = `today is ${moment().format("MMMM")}`;
            break;
         case 'google-search':
         case 'google-open':
         case 'youtube-search':
         case 'youtube-play':
         case 'youtube-open':
         case 'general':
         case "calculator-open":
         case "instagram-open":
         case "facebook-open":
         case "weather-show":
            aiResponse = gemResult.response;
            break;
         case 'chat-clear':
            aiResponse = gemResult.response;
            break;
         default:
            aiResponse = gemResult.response;
      }

      return res.json({
         type,
         userInput: gemResult.userInput,
         response: aiResponse,
      });

   } catch (error) {
      console.error(error);
      return res.status(500).json({ response: "ask assistant guest error" })
   }
}


export const getCurrentUser = async (req, res) => {
   try {
      const userId = req.userId
      const user = await User.findById(userId).select("-password")
      if (!user) {
         return res.status(400).json({ message: "user not found" })
      }

      return res.status(200).json(user)
   } catch (error) {
      return res.status(400).json({ message: "get current user error" })
   }
}

export const updateAssistant = async (req, res) => {
   try {
      const { assistantName, imageUrl } = req.body
      let assistantImage;
      if (req.file) {
         assistantImage = await uploadOnCloudinary(req.file.path)
      } else {
         assistantImage = imageUrl
      }

      const user = await User.findByIdAndUpdate(req.userId, {
         assistantName, assistantImage
      }, { new: true }).select("-password")
      return res.status(200).json(user)


   } catch (error) {
      return res.status(400).json({ message: "updateAssistantError user error" })
   }
}


export const askToAssistant = async (req, res) => {
   try {
      const { command } = req.body
      const user = await User.findById(req.userId);
      user.history.push({ role: "user", content: command })
      user.save()
      const userName = user.name
      const assistantName = user.assistantName
      const result = await groqResponse(command, assistantName, userName)

      const jsonMatch = result.match(/{[\s\S]*}/)
      if (!jsonMatch) {
         return res.ststus(400).json({ response: "sorry, i can't understand" })
      }
      const gemResult = JSON.parse(jsonMatch[0])
      console.log(gemResult)
      const type = gemResult.type

      let aiResponse = "";

      switch (type) {
         case 'get-date':
            aiResponse = `current date is ${moment().format("YYYY-MM-DD")}`;
            break;
         case 'get-time':
            aiResponse = `current time is ${moment().format("hh:mm A")}`;
            break;
         case 'get-day':
            aiResponse = `today is ${moment().format("dddd")}`;
            break;
         case 'get-month':
            aiResponse = `today is ${moment().format("MMMM")}`;
            break;
         case 'google-search':
         case 'google-open':
         case 'youtube-search':
         case 'youtube-play':
         case 'youtube-open':
         case 'general':
         case "calculator-open":
         case "instagram-open":
         case "facebook-open":
         case "weather-show":
            aiResponse = gemResult.response;
            break;
         case 'chat-clear':
            aiResponse = gemResult.response;
            break;
         default:
            aiResponse = gemResult.response;
      }

      // Save AI response to history (except for chat-clear which might clear it, though usually we save confirmation first)
      if (type !== 'chat-clear') {
         user.history.push({ role: "assistant", content: aiResponse });
         await user.save();
      }

      return res.json({
         type,
         userInput: gemResult.userInput,
         response: aiResponse,
      });

   } catch (error) {
      console.error(error);
      return res.status(500).json({ response: "ask assistant error" })
   }
}

export const clearHistory = async (req, res) => {
   try {
      const user = await User.findById(req.userId);
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      user.history = [];
      await user.save();
      return res.status(200).json({ message: "History cleared" });
   } catch (error) {
      return res.status(500).json({ message: "Error clearing history" });
   }
}