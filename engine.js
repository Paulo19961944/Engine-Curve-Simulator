let graficoTorque;
let graficoPotencia;

let dadosCSV = [];





function perfilMotor(categoria, aspiracao, combustivel){


    let subida = 0.35;
    let queda = 0.75;


    if(combustivel === "Diesel"){

        subida = 0.70;
        queda = 0.45;

    }


    if(aspiracao === "Turbo"){

        subida = 0.55;
        queda = 0.70;

    }


    if(aspiracao === "Turbo Diesel"){

        subida = 0.80;
        queda = 0.45;

    }



    switch(categoria){


        case "Moto Urbana":

            subida = 0.55;
            queda = 0.70;

        break;



        case "Moto Custom":

            subida = 0.75;
            queda = 0.55;

        break;



        case "Moto Esportiva":

            subida = 0.25;
            queda = 0.85;

        break;



        case "Caminhão":

            subida = 0.85;
            queda = 0.40;

        break;


    }


    return {
        subida,
        queda
    };

}







function calcularCurva(){


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





    let torquePotencia =
    potenciaMax * 716.2 / rpmPotencia;





    let perfil =
    perfilMotor(
        categoria,
        aspiracao,
        combustivel
    );



    let rpm=[];

    let torque=[];

    let potencia=[];





    for(
        let r=1000;
        r<=corte;
        r+=100
    ){



        let t;



        if(r < rpmTorque){


            let fator =
            r/rpmTorque;


            t =
            torqueMax *
            (
                perfil.subida +
                fator*(1-perfil.subida)
            );


        }

        else{


            let queda =
            (r-rpmTorque) /
            (corte-rpmTorque);



            t =
            torqueMax *
            (
                1 -
                queda*(1-perfil.queda)
            );


        }




        /*
        Mantém o ponto da potência máxima
        */


        if(r >= rpmPotencia){


            let limite =
            torquePotencia *
            (
                1 -
                ((r-rpmPotencia)/(corte-rpmPotencia))*0.35
            );


            if(limite<t){

                t=limite;

            }


        }




        rpm.push(r);


        torque.push(t);


        potencia.push(
            t*r/716.2
        );



    }





    /*
    Correção final:
    nunca ultrapassa a potência informada
    */


    let maiorPotencia =
    Math.max(...potencia);



    if(maiorPotencia > potenciaMax){


        let fator =
        potenciaMax/maiorPotencia;



        torque =
        torque.map(
            t=>t*fator
        );



        potencia =
        torque.map(
            (t,i)=>
            t*rpm[i]/716.2
        );


    }





    return {

        rpm,
        torque,
        potencia

    };

}









function gerarCurva(){


    let dados =
    calcularCurva();



    dadosCSV=[];



    for(let i=0;i<dados.rpm.length;i++){


        dadosCSV.push({

            rpm:dados.rpm[i],

            torque:dados.torque[i],

            potencia:dados.potencia[i]

        });


    }





    criarGraficos(dados);


    criarTabela(dados);


}









function criarGraficos(dados){



    if(graficoTorque)
    graficoTorque.destroy();



    if(graficoPotencia)
    graficoPotencia.destroy();






    let opcoes={


        responsive:true,


        plugins:{


            legend:{


                labels:{


                    color:"white"


                }


            }


        },


        scales:{


            x:{


                ticks:{
                    color:"white"
                }

            },


            y:{


                ticks:{
                    color:"white"
                }

            }


        }


    };







    graficoTorque =
    new Chart(

        document
        .getElementById("graficoTorque"),


        {

            type:"line",


            data:{


                labels:dados.rpm,


                datasets:[{


                    label:"Torque kgfm",

                    data:dados.torque,

                    borderWidth:3


                }]


            },


            options:opcoes


        }

    );







    graficoPotencia =
    new Chart(

        document
        .getElementById("graficoPotencia"),


        {

            type:"line",


            data:{


                labels:dados.rpm,


                datasets:[{


                    label:"Potência cv",

                    data:dados.potencia,

                    borderWidth:3


                }]


            },


            options:opcoes


        }

    );



}









function criarTabela(dados){


    let tabela =
    document.getElementById("tabela");



    tabela.innerHTML="";



    for(
        let i=0;
        i<dados.rpm.length;
        i+=5
    ){



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









function exportarCSV(){


    let texto =
    "RPM,Torque kgfm,Potencia cv\n";



    dadosCSV.forEach(d=>{


        texto +=

        `${d.rpm},${d.torque.toFixed(3)},${d.potencia.toFixed(2)}\n`;


    });



    let blob =
    new Blob(
        [texto],
        {
            type:"text/csv"
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









function gsrPreset(){


    document.getElementById("torque").value=1.08;

    document.getElementById("rpmTorque").value=6000;

    document.getElementById("potencia").value=12;

    document.getElementById("rpmPotencia").value=8000;

    document.getElementById("corte").value=10000;


    document.getElementById("categoria").value=
    "Moto Urbana";


    document.getElementById("aspiracao").value=
    "Aspirado";


    document.getElementById("combustivel").value=
    "Gasolina";


    gerarCurva();


}