import { useParams } from "react-router-dom";
import { useFetchEvaluationQuery } from "../../store";

const LLMResponseEvaluation = () => {

    const { evaluationId }  = useParams();

    console.log(evaluationId)

    return (
        <div>
            LLM Response Evaluation
        </div>
    )
};

export default LLMResponseEvaluation;

