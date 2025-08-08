import { useState } from "react";

const services = [
  "Cabeleireiro",
  "Restaurante",
  "Banho",
  "Café",
  "Conserto de Borracharia",
  "Mecânica",
  "Dormitório",
  "Lavanderia",
  "Área de lazer",
  "Academia / Exercícios",
  "Wi-Fi gratuito",
  "Estacionamento seguro",
];

const preferences = [
  "Muito Importante",
  "Importante",
  "Neutro",
  "Pouco Importante",
  "Não é Importante",
];

interface Question {
  id: number;
  question: string;
  options?: string[];
  followUp?: string;
  type?: "servicesIntro";
}

const questions: Question[] = [
  {
    id: 1,
    question: "1. Qual a sua idade?",
    options: [
      "Menos de 30 anos",
      "30 a 44 anos",
      "45 a 59 anos",
      "60 anos ou mais",
    ],
  },
  {
    id: 2,
    question: "2. Qual o seu gênero?",
    options: ["Masculino", "Feminino", "Outro", "Prefiro não dizer"],
  },
  {
    id: 3,
    question: "3. Tempo de experiência como caminhoneiro",
    options: ["Menos de 1 ano", "1 a 5 anos", "6 a 10 anos", "Mais de 10 anos"],
  },
  {
    id: 4,
    question: "4. Tipo de caminhão que você dirige",
    options: ["Truck", "Carreta", "Bitrem", "Outros"],
  },
  {
    id: 5,
    question:
      "5. Com que frequência você trafega pela BR-251 ou trecho próximo a Grão Mogol?",
    options: [
      "Diariamente",
      "Semanalmente",
      "Quinzenalmente",
      "Mensalmente",
      "Raramente",
    ],
  },
  {
    id: 6,
    question:
      "6. Quantas vezes por dia costuma parar para descanso durante o trajeto?",
    options: ["Nenhuma", "1 vez", "2 vezes", "3 vezes ou mais"],
  },
  {
    id: 7,
    question:
      "7. Em média, quanto tempo você permanece parado nesses pontos de apoio?",
    options: [
      "Menos de 30 minutos",
      "Entre 30 minutos e 1 hora",
      "Entre 1 e 2 horas",
      "Mais de 2 horas",
    ],
  },
  {
    id: 8,
    question:
      "8. Você já procurou algum serviço em ponto de apoio e não encontrou?",
    options: ["Sim", "Não"],
    followUp: "Se respondeu sim, qual serviço você não encontrou?",
  },
  {
    id: 9,
    question:
      "9. Como você avalia a segurança nos locais de parada atualmente disponíveis para caminhoneiros?",
    options: ["Muito seguro", "Seguro", "Neutro", "Inseguro", "Muito inseguro"],
  },
  {
    id: 10,
    question:
      "10. Como você avalia a limpeza e a higiene nos locais de parada atualmente disponíveis para caminhoneiros?",
    options: [
      "Muito Limpo e Higiênico",
      "Limpo e Higiênico",
      "Neutro",
      "Sujo",
      "Muito Sujo e Não Higiênico",
    ],
  },
  {
    id: 11,
    question:
      "11. Como você avalia a qualidade da comida oferecida nos restaurantes dos pontos de parada?",
    options: ["Muito Boa", "Boa", "Neutra", "Ruim", "Muito Ruim"],
  },
  {
    id: 999, // id especial só para a introdução dos serviços
    question:
      "Agora, por favor, indique a importância de cada um dos seguintes serviços para sua experiência como caminhoneiro.",
    type: "servicesIntro",
  },
];

// Geramos perguntas individuais para cada serviço com ids exclusivos
const serviceQuestions: Question[] = services.map((service, idx) => ({
  id: 1000 + idx,
  question: `${idx + 1}. Qual a importância do serviço "${service}" para você?`,
  options: preferences,
}));

export default function CaminhoneiroForm() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [followUps, setFollowUps] = useState<Record<number, string[]>>({}); // Alterado para array de strings
  const [followUpError, setFollowUpError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Total de passos = perguntas + intro dos serviços + perguntas dos serviços
  const totalSteps = questions.length + 1 + serviceQuestions.length;

  function handleNext() {
    // Validação obrigatória de resposta em cada passo
    // Se é a pergunta com followUp e resposta "Sim", validar se pelo menos um serviço foi selecionado
    if (
      step >= 0 &&
      step < questions.length &&
      questions[step].followUp &&
      answers[questions[step].id] === "Sim" &&
      (!followUps[questions[step].id] ||
        followUps[questions[step].id]?.length === 0)
    ) {
      setFollowUpError(true);
      return;
    }

    // Validação de resposta obrigatória em perguntas normais (exceto introdução dos serviços)
    if (
      step >= 0 &&
      step < questions.length &&
      questions[step].type !== "servicesIntro" &&
      !answers[questions[step].id]
    ) {
      setShowModal(true);
      return;
    }
    // Na parte dos serviços individuais, validar cada resposta obrigatória
    if (step >= questions.length + 1) {
      const serviceStepIndex = step - questions.length - 1;
      const currentServiceQuestion = serviceQuestions[serviceStepIndex];
      if (!answers[currentServiceQuestion.id]) {
        setShowModal(true);
        return;
      }
    }

    // Se passar validações
    setFollowUpError(false);
    setShowModal(false);

    // Se passou da última pergunta, ir para tela de obrigado
    if (step + 1 >= totalSteps) {
      submitSurvey();
      // setStep(totalSteps);
    } else {
      setStep((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (step > -1) {
      setStep((prev) => prev - 1);
      setFollowUpError(false);
      setShowModal(false);
    }
  }

  function handleChange(id: number, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function handleServiceToggle(questionId: number, service: string) {
    setFollowUps((prev) => {
      const currentServices = prev[questionId] || [];
      const newServices = currentServices.includes(service)
        ? currentServices.filter((s) => s !== service)
        : [...currentServices, service];

      return { ...prev, [questionId]: newServices };
    });
    setFollowUpError(false);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function submitSurvey() {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Transformar os dados do estado para o formato esperado pelo backend
      const surveyData = {
        age: answers[1],
        gender: answers[2],
        experience: answers[3],
        truckType: answers[4],
        frequency: answers[5],
        stopsPerDay: answers[6],
        stopDuration: answers[7],
        hasMissedServices: answers[8] === "Sim",
        missedServices: answers[8] === "Sim" ? followUps[8] || [] : [],
        safetyRating: answers[9],
        cleanlinessRating: answers[10],
        foodQualityRating: answers[11],
        servicePreferences: services.map((service, idx) => ({
          service,
          importance: answers[1000 + idx],
        })),
      };

      // Substitua a URL pela do seu backend em produção
      const apiUrl =
        "https://backend-questionario.vercel.app/api/survey/submit";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar pesquisa");
      }

      const data = await response.json();
      console.log("Resposta enviada com sucesso:", data);
      setStep(totalSteps); // Avança para a tela de obrigado
    } catch (error: any) {
      console.error("Erro ao enviar pesquisa:", error);
      setSubmitError(
        error.message ||
          "Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Tela inicial antes da pesquisa começar
  if (step === -1) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <div className="w-full max-w-3xl bg-white p-10 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-900">
            Pesquisa com Caminhoneiros da BR-251
          </h1>
          <p className="text-gray-700 text-xl mb-8 leading-relaxed">
            Esta pesquisa faz parte de um estudo acadêmico de mestrado e tem
            como objetivo entender as principais necessidades dos caminhoneiros
            na rodovia BR-251, para o desenvolvimento de soluções e melhorias.
            Sua participação é voluntária, anônima e muito importante.
          </p>
          <button
            onClick={handleNext}
            className="w-full py-4 bg-blue-700 text-white text-xl font-semibold rounded-xl hover:bg-blue-800 transition"
          >
            Aceitar e Iniciar
          </button>
        </div>
      </div>
    );
  }

  // Tela de obrigado depois da última pergunta
  if (step >= totalSteps) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-green-50 p-6">
        <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-extrabold text-green-700 mb-6">
            Obrigado pela sua participação!
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Suas respostas foram registradas com sucesso. Agradecemos muito sua
            colaboração!
          </p>
        </div>
      </div>
    );
  }

  // Renderiza introdução dos serviços
  if (step === questions.length) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <div className="w-full max-w-3xl bg-white p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-extrabold mb-4 text-center text-blue-900">
            Serviços Prioritários
          </h2>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            Agora, por favor, indique a importância de cada um dos seguintes
            serviços para sua experiência como caminhoneiro.
          </p>
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 rounded-xl font-semibold text-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
            >
              Começar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza perguntas comuns (antes da parte dos serviços)
  if (step < questions.length) {
    const currentQuestion = questions[step];
    const progressPercent = ((step + 1) / totalSteps) * 100;

    return (
      <>
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
          <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg flex flex-col">
            {/* Barra de progresso */}
            <div className="mb-6">
              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-center text-sm font-semibold mt-2 text-gray-700">
                Pergunta {step + 1} de {totalSteps}
              </p>
            </div>

            {/* Pergunta */}
            <h2 className="text-xl font-semibold mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Opções */}
            <form className="flex flex-col space-y-3">
              {currentQuestion.options?.map((opt, idx) => (
                <label
                  key={idx}
                  className={`border rounded-xl px-5 py-3 flex items-center space-x-4 cursor-pointer
                    hover:bg-blue-50
                    ${
                      answers[currentQuestion.id] === opt
                        ? "border-blue-600 bg-blue-100"
                        : "border-gray-300 bg-white"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    value={opt}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleChange(currentQuestion.id, opt)}
                    className="accent-blue-600 w-5 h-5"
                  />
                  <span className="text-lg font-medium text-gray-900">
                    {opt}
                  </span>
                </label>
              ))}

              {currentQuestion.followUp &&
                answers[currentQuestion.id] === "Sim" && (
                  <div className="mt-4">
                    <p className="text-lg font-medium mb-3">
                      {currentQuestion.followUp}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {services.map((service, idx) => (
                        <label
                          key={idx}
                          className={`border rounded-xl px-5 py-3 flex items-center space-x-4 cursor-pointer
                            hover:bg-blue-50
                            ${
                              followUps[currentQuestion.id]?.includes(service)
                                ? "border-blue-600 bg-blue-100"
                                : "border-gray-300 bg-white"
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={
                              followUps[currentQuestion.id]?.includes(
                                service
                              ) || false
                            }
                            onChange={() =>
                              handleServiceToggle(currentQuestion.id, service)
                            }
                            className="accent-blue-600 w-5 h-5"
                          />
                          <span className="text-lg font-medium text-gray-900">
                            {service}
                          </span>
                        </label>
                      ))}
                    </div>
                    {followUpError && (
                      <p className="text-sm text-red-600 mt-3 font-semibold">
                        Por favor, selecione pelo menos um serviço.
                      </p>
                    )}
                  </div>
                )}
            </form>

            {/* Navegação */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 0}
                className={`px-6 py-3 rounded-xl font-semibold text-lg
                  ${
                    step === 0
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }
                `}
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>

        {/* Modal para erro */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-xl border border-gray-200">
              <h3 className="text-2xl font-extrabold mb-4 text-blue-900">
                Atenção
              </h3>
              <p className="mb-6 text-gray-700 text-lg leading-relaxed">
                Por favor, responda a pergunta antes de continuar.
              </p>
              <button
                onClick={closeModal}
                className="px-8 py-3 bg-blue-700 text-white rounded-2xl font-semibold hover:bg-blue-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Renderiza perguntas individuais dos serviços
  if (step > questions.length) {
    const serviceStepIndex = step - questions.length - 1;
    const currentServiceQuestion = serviceQuestions[serviceStepIndex];
    const progressPercent = ((step + 1) / totalSteps) * 100;

    return (
      <>
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
          <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg flex flex-col">
            {/* Barra de progresso */}
            <div className="mb-6">
              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-center text-sm font-semibold mt-2 text-gray-700">
                Pergunta {step + 1} de {totalSteps}
              </p>
            </div>

            {/* Pergunta */}
            <h2 className="text-xl font-semibold mb-6 leading-relaxed">
              {currentServiceQuestion.question}
            </h2>

            {/* Opções */}
            <form className="flex flex-col space-y-3">
              {currentServiceQuestion.options?.map((opt, idx) => (
                <label
                  key={idx}
                  className={`border rounded-xl px-5 py-3 flex items-center space-x-4 cursor-pointer
                  hover:bg-blue-50
                  ${
                    answers[currentServiceQuestion.id] === opt
                      ? "border-blue-600 bg-blue-100"
                      : "border-gray-300 bg-white"
                  }
                `}
                >
                  <input
                    type="radio"
                    name={`q-${currentServiceQuestion.id}`}
                    value={opt}
                    checked={answers[currentServiceQuestion.id] === opt}
                    onChange={() =>
                      handleChange(currentServiceQuestion.id, opt)
                    }
                    className="accent-blue-600 w-5 h-5"
                  />
                  <span className="text-lg font-medium text-gray-900">
                    {opt}
                  </span>
                </label>
              ))}
            </form>

            {/* Navegação */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 rounded-xl font-semibold text-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Voltar
              </button>

              <button
                disabled={isSubmitting}
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {step + 1 === totalSteps ? "Enviando..." : "Carregando..."}
                  </>
                ) : step + 1 === totalSteps ? (
                  "Finalizar"
                ) : (
                  "Próximo"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal para erro */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-xl border border-gray-200">
              <h3 className="text-2xl font-extrabold mb-4 text-blue-900">
                Atenção
              </h3>
              <p className="mb-6 text-gray-700 text-lg leading-relaxed">
                Por favor, responda a pergunta antes de continuar.
              </p>
              <button
                onClick={closeModal}
                className="px-8 py-3 bg-blue-700 text-white rounded-2xl font-semibold hover:bg-blue-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Por segurança, caso entre em algum fluxo inesperado
  return null;
}
