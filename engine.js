let graficoTorque;
let graficoPotencia;

let dadosCSV = [];


function perfilMotor(categoria, aspiracao, combustivel) {


    let subida = 0.35;
    let queda = 0.75;



    // Combustível

    if (combustivel === "Diesel") {

        subida = 0.80;
        queda = 0.45;

    }


    if (aspiracao === "Turbo") {

        subida = 0.55;
        queda = 0.70;

    }


    if (aspiracao === "Turbo Diesel") {

        subida = 0.85;
        queda = 0.40;

    }





    switch (categoria) {


        // =====================
        // MOTOS
        // =====================


        case "Moto Urbana":

            subida = 0.55;
            queda = 0.70;

            break;



        case "Scooter":

            subida = 0.70;
            queda = 0.55;

            break;



        case "CUB":

            subida = 0.65;
            queda = 0.60;

            break;



        case "Moto Trail":

            subida = 0.60;
            queda = 0.65;

            break;



        case "Moto Custom":

            subida = 0.80;
            queda = 0.50;

            break;



        case "Moto Esportiva":

            subida = 0.25;
            queda = 0.85;

            break;






        // =====================
        // CARROS
        // =====================


        case "Carro Popular":

            subida = 0.50;
            queda = 0.65;

            break;



        case "Carro Clássico":

            subida = 0.65;
            queda = 0.55;

            break;



        case "Carro Esportivo":

            subida = 0.30;
            queda = 0.90;

            break;




        case "VVT-i":

            subida = 0.45;
            queda = 0.80;

            break;



        case "VTEC":

            subida = 0.25;
            queda = 0.95;

            break;






        // =====================
        // MUSCLE
        // =====================


        case "Muscle Car Clássico":

            subida = 0.85;
            queda = 0.45;

            break;



        case "Muscle Car Moderno":

            subida = 0.70;
            queda = 0.80;

            break;







        // =====================
        // UTILITÁRIOS
        // =====================



        case "Picape Pequena":

            subida = 0.70;
            queda = 0.55;

            break;




        case "Caminhonete":

            subida = 0.85;
            queda = 0.45;

            break;




        case "SUV Moderno":

            subida = 0.65;
            queda = 0.70;

            break;




        case "SUV Clássico":

            subida = 0.80;
            queda = 0.50;

            break;




        case "Caminhão":

            subida = 0.90;
            queda = 0.35;

            break;


    }



    return {

        subida,
        queda

    };


}


function calcularCurva() {

    let torqueMax =
        Number(document.getElementById("torque").value);

    let rpmTorque =
        Number(document.getElementById("rpmTorque").value);

    let potenciaMax =
        Number(document.getElementById("potencia").value);

    let rpmPotencia =
        Number(document.getElementById("rpmPotencia").value);

    let corte =
        Number(document.getElementById("corte").value);

    let categoria =
        document.getElementById("categoria").value;

    let aspiracao =
        document.getElementById("aspiracao").value;

    let combustivel =
        document.getElementById("combustivel").value;

    // Torque correspondente à potência máxima no rpm alvo.
    let torquePotencia =
        potenciaMax * 716.2 / rpmPotencia;

    let perfil =
        perfilMotor(
            categoria,
            aspiracao,
            combustivel
        );

    // Proteções contra divisão por zero / configurações estranhas.
    let faixaSubida = Math.max(1, rpmTorque - 1000);
    let faixaAtePotencia = Math.max(1, rpmPotencia - rpmTorque);
    let faixaAteCorte = Math.max(1, corte - rpmPotencia);

    let rpm = [];
    let torque = [];
    let potencia = [];

    for (
        let r = 1000;
        r <= corte;
        r += 100
    ) {

        let t;

        // Região 1: de 1000 rpm até rpmTorque (subida até torqueMax)
        if (r <= rpmTorque) {
            // Normaliza 1000..rpmTorque -> 0..1
            let fator = (r - 1000) / faixaSubida;
            fator = Math.max(0, Math.min(1, fator));

            let torqueInicial = torqueMax * perfil.subida;

            // Garante que em rpmTorque t == torqueMax
            t = torqueInicial + (torqueMax - torqueInicial) * fator;

        // Região 2: rpmTorque..rpmPotencia (ajusta para chegar no torque compatível com potenciaMax)
        } else if (r <= rpmPotencia) {
            let distancia = r - rpmTorque;
            let faixa = faixaAtePotencia;
            let queda = distancia / faixa;
            queda = Math.max(0, Math.min(1, queda));

            // Interpola suave torqueMax -> torquePotencia
            t = torqueMax - (torqueMax - torquePotencia) * queda;

        // Região 3: rpmPotencia..corte (queda até o corte)
        } else {
            // Para simular “característica” sem degrau logo após o pico,
            // mantemos a potência no máximo por um passo de malha.
            // Assim: em rpmPotencia e no próximo ponto (rpmPotencia + 100),
            // a potência permanece em potenciaMax.
            let proximoPasso = rpmPotencia + 100;

            if (r <= proximoPasso + 1e-9) {
                t = torquePotencia;
            } else {
                let distancia = r - rpmPotencia;
                let quedaFinal = distancia / faixaAteCorte;
                quedaFinal = Math.max(0, Math.min(1, quedaFinal));

                // Perfil.queda controla o quão agressiva é a queda.
                // Usa um coeficiente moderado para manter formato natural.
                let agressividade = 0.45 * (1 - perfil.queda);
                t = torquePotencia * (1 - quedaFinal * agressividade);
            }
        }

        rpm.push(r);
        torque.push(t);
        potencia.push(t * r / 716.2);


    }

    // Correção final:
    // - forçar o ponto mais próximo de rpmPotencia a ter potenciaMax
    // - e garantir que NENHUM outro ponto ultrapasse potenciaMax
    //   (ex.: do tipo “torque continua alto após 8000 rpm”, então precisamos limitar).
    let alvoIdx = 0;
    let menorDist = Infinity;
    for (let i = 0; i < rpm.length; i++) {
        let dist = Math.abs(rpm[i] - rpmPotencia);
        if (dist < menorDist) {
            menorDist = dist;
            alvoIdx = i;
        }
    }

    if (torque[alvoIdx] > 0 && isFinite(torque[alvoIdx])) {
        let fator = (potenciaMax * 716.2 / rpm[alvoIdx]) / torque[alvoIdx];
        if (isFinite(fator) && fator > 0) {
            torque = torque.map(t => t * fator);
            potencia = torque.map((t, i) => t * rpm[i] / 716.2);
        }
    }

    // Clampe: nunca ultrapassar potenciaMax
    for (let i = 0; i < potencia.length; i++) {
        if (potencia[i] > potenciaMax) {
            potencia[i] = potenciaMax;
            // reconverte potência clampada -> torque correspondente
            torque[i] = potencia[i] * 716.2 / rpm[i];
        }
    }

    return { rpm, torque, potencia };

}










function gerarCurva() {


    let dados =
        calcularCurva();



    dadosCSV = [];



    for (let i = 0; i < dados.rpm.length; i++) {


        dadosCSV.push({

            rpm: dados.rpm[i],

            torque: dados.torque[i],

            potencia: dados.potencia[i]

        });


    }





    criarGraficos(dados);


    criarTabela(dados);


}









function criarGraficos(dados) {



    if (graficoTorque)
        graficoTorque.destroy();



    if (graficoPotencia)
        graficoPotencia.destroy();






    let opcoes = {


        responsive: true,


        plugins: {


            legend: {


                labels: {


                    color: "white"


                }


            }


        },


        scales: {


            x: {


                ticks: {
                    color: "white"
                }

            },


            y: {


                ticks: {
                    color: "white"
                }

            }


        }


    };







    graficoTorque =
        new Chart(

            document
                .getElementById("graficoTorque"),


            {

                type: "line",


                data: {


                    labels: dados.rpm,


                    datasets: [{


                        label: "Torque kgfm",

                        data: dados.torque,

                        borderWidth: 3


                    }]


                },


                options: opcoes


            }

        );







    graficoPotencia =
        new Chart(

            document
                .getElementById("graficoPotencia"),


            {

                type: "line",


                data: {


                    labels: dados.rpm,


                    datasets: [{


                        label: "Potência cv",

                        data: dados.potencia,

                        borderWidth: 3


                    }]


                },


                options: opcoes


            }

        );



}









function criarTabela(dados) {


    let tabela =
        document.getElementById("tabela");



    tabela.innerHTML = "";



    for (
        let i = 0;
        i < dados.rpm.length;
        i += 5
    ) {



        tabela.innerHTML += `


        <tr>

        <td>
        ${dados.rpm[i]}
        </td>


        <td>
        ${dados.torque[i].toFixed(3)}
        kgfm
        </td>


        <td>
        ${dados.potencia[i].toFixed(2)}
        cv
        </td>


        </tr>


        `;


    }


}









function exportarCSV() {


    let texto =
        "RPM,Torque kgfm,Potencia cv\n";



    dadosCSV.forEach(d => {


        texto +=

            `${d.rpm},${d.torque.toFixed(3)},${d.potencia.toFixed(2)}\n`;


    });



    let blob =
        new Blob(
            [texto],
            {
                type: "text/csv"
            }
        );



    let link =
        document.createElement("a");



    link.href =
        URL.createObjectURL(blob);



    link.download =
        "curva_motor.csv";



    link.click();



}









function gsrPreset() {


    document.getElementById("torque").value = 1.08;

    document.getElementById("rpmTorque").value = 6000;

    document.getElementById("potencia").value = 12;

    document.getElementById("rpmPotencia").value = 8000;

    document.getElementById("corte").value = 10000;


    document.getElementById("categoria").value =
        "Moto Urbana";


    document.getElementById("aspiracao").value =
        "Aspirado";


    document.getElementById("combustivel").value =
        "Gasolina";


    gerarCurva();


}