// components/NotFound.js
import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200 text-gray-800">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="text-center p-6 bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="mb-4 text-indigo-600"
        >
          <ErrorOutlineIcon style={{ fontSize: 80 }} />
        </motion.div>

        <h1 className="text-4xl font-extrabold mb-2 text-indigo-700">404</h1>
        <p className="text-xl mb-4">Oops! Page not found.</p>
        <p className="text-gray-600 mb-6">
          The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            className="!bg-indigo-600 hover:!bg-indigo-700 transition-all duration-300"
          >
            Go to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
