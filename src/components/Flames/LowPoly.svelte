<div class="fire">
    <div class="flames">
        <div class="flame" />
        <div class="flame" />
        <div class="flame" />
        <div class="flame" />
    </div>
</div>

<style>
    .fire {
        position: relative;
        height: 10em;
        width: 10em;
        font-size: 3px;
        transform: translate(0, 2em);
    }
    .fire .flames {
        position: absolute;
        bottom: 40%;
        left: 50%;
        width: 60%;
        height: 60%;
        transform: translateX(-50%) rotate(45deg);
    }
    .fire .flames .flame {
        position: absolute;
        right: 0%;
        bottom: 0%;
        width: 0%;
        height: 0%;
        background-color: #ffdc01;
        border-radius: 4px;
    }
    .fire .flames .flame:nth-child(2n + 1) {
        -webkit-animation: flameodd 1.5s ease-in infinite;
        animation: flameodd 1.5s ease-in infinite;
    }
    .fire .flames .flame:nth-child(2n) {
        -webkit-animation: flameeven 1.5s ease-in infinite;
        animation: flameeven 1.5s ease-in infinite;
    }
    .fire .flames .flame:nth-child(1) {
        -webkit-animation-delay: 0s;
        animation-delay: 0s;
    }
    .fire .flames .flame:nth-child(2) {
        -webkit-animation-delay: 0.375s;
        animation-delay: 0.375s;
    }
    .fire .flames .flame:nth-child(3) {
        -webkit-animation-delay: 0.75s;
        animation-delay: 0.75s;
    }
    .fire .flames .flame:nth-child(4) {
        -webkit-animation-delay: 1.125s;
        animation-delay: 1.125s;
    }
    .fire .logs {
        position: absolute;
        bottom: 25%;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 15%;
    }
    .fire .logs:before,
    .fire .logs:after {
        position: absolute;
        content: "";
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(20deg);
        height: 100%;
        width: 100%;
        border-radius: 1vw;
        background-color: #70392f;
    }
    .fire .logs:before {
        transform: translate(-50%, -50%) rotate(-20deg);
        background-color: #612e25;
    }

    @-webkit-keyframes flameodd {
        0%,
        100% {
            width: 0%;
            height: 0%;
        }
        25% {
            width: 100%;
            height: 100%;
        }
        0% {
            background-color: #ffdc01;
            z-index: 1000000;
        }
        40% {
            background-color: #fdac01;
            z-index: 1000000;
        }
        100% {
            background-color: #f73b01;
            z-index: -10;
        }
        0% {
            right: 0%;
            bottom: 0%;
        }
        25% {
            right: 1%;
            bottom: 2%;
        }
        100% {
            right: 150%;
            bottom: 170%;
        }
    }

    @keyframes flameodd {
        0%,
        100% {
            width: 0%;
            height: 0%;
        }
        25% {
            width: 100%;
            height: 100%;
        }
        0% {
            background-color: #ffdc01;
            z-index: 1000000;
        }
        40% {
            background-color: #fdac01;
            z-index: 1000000;
        }
        100% {
            background-color: #f73b01;
            z-index: -10;
        }
        0% {
            right: 0%;
            bottom: 0%;
        }
        25% {
            right: 1%;
            bottom: 2%;
        }
        100% {
            right: 150%;
            bottom: 170%;
        }
    }
    @-webkit-keyframes flameeven {
        0%,
        100% {
            width: 0%;
            height: 0%;
        }
        25% {
            width: 100%;
            height: 100%;
        }
        0% {
            background-color: #ffdc01;
            z-index: 1000000;
        }
        40% {
            background-color: #fdac01;
            z-index: 1000000;
        }
        100% {
            background-color: #f73b01;
            z-index: -10;
        }
        0% {
            right: 0%;
            bottom: 0%;
        }
        25% {
            right: 2%;
            bottom: 1%;
        }
        100% {
            right: 170%;
            bottom: 150%;
        }
    }
    @keyframes flameeven {
        0%,
        100% {
            width: 0%;
            height: 0%;
        }
        25% {
            width: 100%;
            height: 100%;
        }
        0% {
            background-color: #ffdc01;
            z-index: 1000000;
        }
        40% {
            background-color: #fdac01;
            z-index: 1000000;
        }
        100% {
            background-color: #f73b01;
            z-index: -10;
        }
        0% {
            right: 0%;
            bottom: 0%;
        }
        25% {
            right: 2%;
            bottom: 1%;
        }
        100% {
            right: 170%;
            bottom: 150%;
        }
    }
</style>
