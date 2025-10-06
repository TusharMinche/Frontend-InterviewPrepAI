import React, { useEffect, useState } from 'react'
import { data, useParams } from 'react-router-dom';
import moment from"moment";
import{ AnimatePresence, motion} from "framer-motion";
import { LuCircleAlert , LuListCollapse} from "react-icons/lu";
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import{ toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
const InterviewPrep = () => {
  const { sessionId } = useParams();
  const [sessionData,setSessionData] = useState(null);
  const [errorMsg , setErrorMsg ] = useState("");

  const [openLeanMoreDrawer , setOpenLeanMoreDrawer ] = useState(false);
  const [explanations , setExplanations] = useState(null);

  const [ isLoading , setIsLoading] = useState(false);
  const [isUpdateLoader , setIsUpdateLoader] = useState(false);

  //Fetch session data by session id 
  const fetchSessionDetailsById = async () => {
    try{
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data && response.data.session){
        setSessionData(response.data.session);
      }
    } catch(error) {
      console.error("Error",error);
    }
  };

  //Generate concept explanation
  const generateConceptExplaination = async (question) => {
    try{
      setErrorMsg("");
      setExplanations(null);

      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );
console.log("API Response:", response.data);
      if (response.data) {
        setExplanations(response.data);
      }
    } catch (error) {
      setExplanations(null)
      setErrorMsg("Failed to generate explaination ,try again later");
      console.error("Error:",error);
    } finally {
      setIsLoading(false);
    }
  };

  //Pin Question 
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log(response);

      if (response.data && response.data.question) {
        //toast.success('Question Pinned Successfully)
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error("Error:",error);
    }
  };

  //ADD more quetions to a session
  const uploadMoreQuestions = async () => {
    try{
      setIsUpdateLoader(true);


      //Call AI API to generate questions 
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      //should be array like [{questions,answer}.....]
      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Added more Q&A!!");
        fetchSessionDetailsById();

      }
    } catch (error){
      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
      } else{
        setError("Something went wrong . Please try again");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
    return () => {};
  }, []);
  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience ||"-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).from("Do MMM YYYY")
            :""
        }
    />
    <div className='container mx-auto pt-4 pb-4 px-4 md:px-0'>
      <h2 className='text-lg font-semibold color-black'>Interview Q & A</h2>


      <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
        <div
          className={`col-span-12 ${
            openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
          }`}
        >

          <AnimatePresence>
            {sessionData?.questions?.map((data, index) => {
              return (
                <motion.div
                  key={data._id || index}
                  initial={{opacity:0 , y: -20}}
                  animate={{opacity: 1,y: 0}}
                  exit={{ opacity: 0 , scale:0.95}}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 15,
                  }}
                  layout //This is the key prop that animates position changes
                  layoutId={`question-${data._id || index}`}//helps  framer track specific items 
                >
                  <>
                    <QuestionCard
                      question={data?.question}
                      answer={data?.answer}
                      onLearnMore={() => 
                        generateConceptExplaination(data.question)
                      }
                      isPinned={data?.isPinned}
                      onTogglePin={() => toggleQuestionPinStatus(data._id)}
        
                    /> 
                  
                  

                  {!isLoading &&
                    sessionData?.questions?.length == index + 1 && (
                      <div className='flex items-center justify-center mt-5'>
                        <button 
                          className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer'
                          disabled={isLoading || isUpdateLoader}
                          onClick={uploadMoreQuestions}
                        >
                          {isUpdateLoader ? (
                            <SpinnerLoader />
                          ) : (
                            <LuListCollapse className='text-lg' />
                          )}{" "}
                          Load More Questions 
                        </button>
                      </div>
                    )}

                    </>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>



      <div>
        <Drawer 
          isOpen={openLeanMoreDrawer}
          onClose={() => setOpenLeanMoreDrawer(false)}
          title={!isLoading && explanations?.title}
        >
          {errorMsg && (
            <p className='flex gap-2 text-sm text-amber-600 font-medium'>
              <LuCircleAlert className='mt-1' /> {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanations && (
            <AIResponsePreview content={explanations?.explanations} />
          )}
        </Drawer>
      </div>
    </div>         
    </DashboardLayout>
  )
}

export default InterviewPrep
