import {defs, tiny} from './examples/common.js';
import {Body, Simulation, Test_Data} from './examples/collisions-demo.js';
import {objs} from './models.js';
//import { Simulation } from './examples/control-demo.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Capped_Cylinder, Textured_Phong_text, Phong_Shader, Regular_2D_Polygon, Closed_Cone } = defs;
const {SceneGraph, HumanFigure, soccerNet, Block1, Block2, Chick, Chicken, BoundingBox, Soccer_ball, SoccerFieldBoundary} = objs



export class Main extends Simulation {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        
        

        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .52, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/blue.png")
            }),
            block2: new Material(new Textured_Phong(), {
                color: hex_color("#ff745e"),
                ambient: .6, diffusivity: .1, specularity: 0.5,
                texture: new Texture("assets/block.jpg")
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .1, diffusivity: .8, specularity: 0.5,
                texture: new Texture("assets/net21.png")
            }),
            net: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/net21.png")
            }),
            sky: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .5, diffusivity:.1, specularity: 0.1,
                texture: new Texture("assets/sky2.png"),
            }),
            blank: new Material(new Textured_Phong(), {
                color: hex_color("#edef00"),
                ambient: .5, diffusivity: 1, specularity: .1,
                texture: new Texture("assets/white.jpeg")
            }),
            ball_skin: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.48, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/ball.png")
            }),
            grass: new Material(new Textured_Phong(), {
                color: hex_color("#00FF00"), // 绿色草地
                ambient: 0.4, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "LINEAR")

            }),
            boundary_material: new Material(new Textured_Phong(),
            {   ambient: 1, 
                color: color(1, 1, 1, 1)
            
            }),
 
        }
        this.shapes = {
            tube: new Cylindrical_Tube(1, 20),
            human: new HumanFigure(this.materials.phong, Mat4.scale(.8, .8, .8).times(Mat4.translation(0, 1.875, 0))),
            ///1.4/.8
            net: new soccerNet(this.materials.texture, Mat4.translation(0, 3, -30).times(Mat4.rotation(Math.PI, 0, 1, 0))),
            poly: new Regular_2D_Polygon(4, 2),
            box: new Cube(),
            sphere: new Subdivision_Sphere(4),
            block: new Block1(this.materials.phong, Mat4.translation(-6, 3, -8)),
            chick: new Chick(this.materials.blank, Mat4.translation(-8, 1.8, 3)),
            chicken:new Chicken(this.materials.blank, Mat4.translation(0 ,1.8, 0)),
            test: new Body(new Chick(this.materials.blank), this.materials.blank, vec3(3.8,7.5,2)),
            test4: new Body(new Chicken(this.materials.blank), this.materials.blank, vec3(3.8,7.5,2)),
            test2: new Body(new HumanFigure(this.materials.phong), this.materials.phong, vec3(3.8,7.5,2)),
            test3: new Body(new Subdivision_Sphere(4), this.materials.phong, vec3(2, 2, 2)),
            block2: new Block2(this.materials.block2, Mat4.identity().times(Mat4.translation(0, 0.5+0.35, 0))),
            // ground: new Regular_2D_Polygon(100,100),
            // soccer field
            field: new Regular_2D_Polygon(100, 100), // 4个顶点，1表示矩形
            ball: new Soccer_ball(this.materials.ball_skin, Mat4.scale(0.7, 0.7, 0.7)),
            field_boundary: new SoccerFieldBoundary(this.materials.boundary_material, Mat4.identity())
        }
        
        this.shapes.field.bound = new BoundingBox(0,0,0,100,1,100);
        this.backgroundMusic = new Audio('music/background_music.mp3');
        this.backgroundMusic.loop = true;
        
        // For human
        this.moving = false
        this.forward = false
        this.back = false
        this.left = false
        this.right = false
        this.agent_pos = vec3(0, -.25, 30)
        this.collision = false
        this.direction = 1
        this.face = "forward" 
        this.agent_trans = Mat4.identity() // store the character's translation value
        this.agent_rot = vec4(0,0,0,0)   // store the character's rotation state 
        this.agent_size = 0.8      // scale
        // For ball
        this.ball_pos = vec3(0,0.7,29)
            //this.ball_pos = vec3(-4.6,0.9,-26.5)  //testing position point, there may be some rounding issue but it works
        this.kick = false
        this.time = 0
        this.linear_velocity_yz = vec3(0,0,0)
        this.ball_collision = false
        this.get_goal = false
        this.ball_out = false
        this.movement_face;
        // For view point
        this.first = false
        this.second = false
        this.third = false
        this.initial_camera_location = Mat4.look_at(vec3(-15, 8, 40), vec3(5, 0, 0), vec3(0, 5, 0));
        
        //把所有需要碰撞检测的东西（除了移动的主体以外放进这个列表里）
        //初始化障碍物位置，球网位置固定，鸡群只刷一只
        this.still_items = [this.shapes.net, this.shapes.chicken]
        //随机刷新的障碍物的种类
        this.types = ["block1", "chick", "block2"]
        //可调整： 随机生成障碍物的位置
        this.areas = [[Math.random() * (-11+21) -21, Math.random() * (20-10) +10], 
                        [Math.random() * (-11+21) -21, Math.random() * (-10+20) -20],
                        [Math.random() * (-11+21) -21, Math.random() * (5+5) -5], 
                        [Math.random() * (5+5) -5, Math.random() * (20-10) +10],
                        [Math.random() * (5+5) -5, Math.random() * (-10+20) - 20],
                        [Math.random() * (5+5) -5, Math.random() * (5+5) -5],
                        [Math.random() * (21-11) +11, Math.random() * (20-10) +10], 
                        [Math.random() * (21-11) +11, Math.random() * (-10+20) - 20],
                        [Math.random() * (21-11) +11, Math.random() * (5+5) -5]]
        //随机鸡群位置
        let random = Math.floor(Math.random() * (5-0) + 0)
        this.chicken_pos = this.areas[random]

        //必须保证鸡群刷新位置在bound最左侧，不然会发生障碍物之间的碰撞
        let counter = this.chicken_pos[0]
        if (counter <= -11) {counter = -21}
        else if (counter <= 5) {counter = -5}
        else {counter = 11}
        this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.translation(counter, 0, this.chicken_pos[1])) 
        
        //位置列表中去除鸡群位置
        this.areas.splice(random, 1)
        this.length = 10
        this.temp = this.length
        this.chicken_direction = true
    
        //random_refresh: 填充this.still_items 列表，随机位置，随机物件
        for (let i of this.areas) {
            this.random_refresh(i)
        }
        
    }

 

    make_control_panel() {
        // "m" to controal the background_music
        this.key_triggered_button("Toggle Music", ["m"], () => {
            this.toggleMusic();
        });

        this.key_triggered_button("Follow Human", ["Control", "1"], () => {
            this.first = true
            this.second = false
            this.third = false
        });

        this.key_triggered_button("Camera from Left", ["Control", "2"], () => {
            this.first = false
            this.second = true
            this.third = false
        });
        this.key_triggered_button("Camera from Right", ["Control", "3"], () => {
            this.first = false
            this.second = false
            this.third = true
        });


        this.key_triggered_button("Initial Perspective", ["Control", "4"], () => {
            this.first = false
            this.second = false
            this.third = false
        });
        this.key_triggered_button("Restart", ["r"], () => {

            this.restart()
  
        });
        
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => {
            this.moving = true
            this.forward = true 
            
        }, undefined, () => {
            this.moving = false
            this.forward = false
        });

        

        // Move backward
        this.key_triggered_button("Move Backward", ["ArrowDown"], () => {
            this.moving = true
            this.back = true
  


        }, undefined, () => {
            this.moving = false
            this.back = false
        });

        this.key_triggered_button("Move Left", ["ArrowLeft"], () => {
            this.moving = true
            this.left = true

        }, undefined, () => {
            this.moving = false
            this.left = false
        });

        this.key_triggered_button("Move Right", ["ArrowRight"], () => {
            this.moving = true
            this.right = true

        }, undefined, () => {
            this.moving = false
            this.right = false
        });

        this.key_triggered_button("Kick", ["k"], () =>{
            if (this.shapes.human.bound.close (this.shapes.ball.bound)) {
                this.kick = true
                this.time = 0
            }
        })

    }

    // For key_triggered_button 'm' controal music
    playMusic() {
        this.backgroundMusic.play().catch(e => console.error("Error playing music:", e));
    }
    pauseMusic() {
        this.backgroundMusic.pause();
    }
    toggleMusic() {
        if (this.backgroundMusic.paused) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }
    restart() {
        location.reload()
    }

    // For stopping human after an obstacle collision
    stop_human_figure() {
        this.moving = false
        this.shapes.human.stop_swin()
    }
    
    //random_refresh: refresh the blocks in the given area
    random_refresh(area, type=this.types[Math.floor(Math.random()*this.types.length)]) {
        if (type == "block1")
        this.still_items.push(new Block1(this.materials.phong, Mat4.scale(.7,.7,.7).times(Mat4.translation(area[0], 3, area[1]))))
        if (type == "chick")
        this.still_items.push(new Chick(this.materials.blank, Mat4.translation(area[0], 1.8, area[1])))
        if (type == "block2")
        this.still_items.push(new Block2(this.materials.block2, Mat4.translation(area[0], 0.85, area[1])))
 
        
    }

    //鸡群移动，length = 10
    move_chicken(chicken, dt=this.dt) {
        let speed = 10
        let temp = dt*speed
            chicken.update_pos()
            chicken.update_bound()
            chicken.wobble(this.t, this.direction)
            
            if (this.chicken_direction) {
            chicken.model_transform[0][3] = chicken.model_transform[0][3] + temp
            }
            
            else {
                chicken.model_transform[0][3] = chicken.model_transform[0][3] - temp}

            return temp
    

    }

    
    kicking_ball(ball, dt=this.dt) {
        let kick_angle_hon = Math.sin(Math.PI/8)/10
        //let prev_pos = this.ball_pos
        console.log("kick on")
        console.log(this.ball_pos[1])
        
        if(this.time == 0)
            this.movement_face = this.face; // prevent the angle change while the movement
        if(this.movement_face == "forward")
        {
            if (this.ball_collision) {
                // linear_velocity_yz is a velocity vector that has magnitude and direction in every this.time unit(like real time)
                this.linear_velocity_yz[2] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle_hon
                // point + vector = movement
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[2] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle_hon
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "backward")
        {
            if (this.ball_collision) {
                this.linear_velocity_yz[2] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle_hon

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[2] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle_hon
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "left")
        {
            if (this.ball_collision) {
                this.linear_velocity_yz[0] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = kick_angle_hon

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[0] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = kick_angle_hon
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "right")
        {
            if (this.ball_collision) {
                this.linear_velocity_yz[0] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = kick_angle_hon

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);           
            }
            else{
                this.linear_velocity_yz[0] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = kick_angle_hon
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }
        
        // spinning, from ethan
        let rotation_angle = this.linear_velocity_yz.norm() / .8 * this.time;
        ball.model_transform = ball.model_transform.times(Mat4.rotation(rotation_angle,1,0,0))

         ++this.time;
        
        // stop kick condition
        if(this.ball_pos[1]<0.68)
        {
            this.kick = false;
            this.ball_collision = false;
            
            console.log("kick off")
            // correct ball's position
            this.ball_pos[1] = .699
            console.log(this.ball_pos[1])
        }
            
    }

    check_goal()
    {// check passing through the imagine goal
        if((this.ball_pos[0] >= -4.6 || this.ball_pos[0] <= 5.2) &&  // -4.6 < x < 5.2
           (this.ball_pos[1] >= .9 || this.ball_pos[1] <= 4.7) &&    // 0.9 < y < 4.7
           (this.ball_pos[2] <= -26.4) )                             //       z < -26.4
                this.get_goal = true;
            //console.log(this.get_goal)
    }

    check_out_of_bound()
    {// check passing through the boundary
        if((this.ball_pos[0] <= -28 || this.ball_pos[0] >= 29) ||  // -28 < x < 29
           (this.ball_pos[2] <= -25 || this.ball_pos[2] >= 38) )     // -25 < z < 38                
                this.ball_out = true;
            //console.log(this.ball_out)
        
        // respawn human and ball
        if(this.ball_out)
        {
            this.ball_pos = vec3(0,0.7,29);
            this.agent_pos = vec3(0, -.25, 30);
            if(this.face == "backward")
                this.agent_rot[0] -= Math.PI;
            else if(this.face == "left")
                this.agent_rot[0] += Math.PI/2;
            else if(this.face == "right")
                this.agent_rot[0] -= Math.PI/2;
            this.ball_out = false;
            this.kick = false;
            this.face = "forward";
        }
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)));
        }

        

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 1000);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.t = program_state.animation_time / 1000;
        this.dt = program_state.animation_delta_time / 1000;
        
        //grass update
        for (let i = 0; i < this.shapes.field.arrays.texture_coord.length; ++i) {
            this.shapes.field.arrays.texture_coord[i].scale_by(12)
        } 
        this.shapes.field_boundary.draw(context, program_state, Mat4.identity())                                  
        
        let speed = 10.0

        if (this.moving && ! this.collision) { 
            let speed = 10.0;
            this.shapes.human.swingArm(program_state.animation_time / 300)  // Changing the swing time
            this.shapes.human.swingLeg(program_state.animation_time / 300)
            if (this.forward) {
                if(this.face != "forward")
                {
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}  //Rotate 90° to the left
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;} //Rotate 90° to the right
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;} //Rotate 180° to the backward
                
                    this.face = "forward";
                }
                this.agent_pos[2] -= this.dt * speed;  // Decrease the human's Z-axis value
               
    
            }
            if (this.back) {
                
                if(this.face != "backward")
                {
                    
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    
                    this.face = "backward";
                }
                this.agent_pos[2] += this.dt * speed;
              
            }
            if (this.left) {
                
                if(this.face != "left")
                {
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
    
                    this.face = "left";
                }
                this.agent_pos[0] -= this.dt * speed;
                
            }
            if (this.right) {
                
                if(this.face != "right")
                {
                   
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    
                    this.face = "right";
                }
                this.agent_pos[0] += this.dt * speed;
                
            }
        
        }else if (this.collision) {
            //.2 is used to fine-tune the position of the character in the event of a collision, 
            //so that it can "move back" or "move away" from the colliding object slightly.
            if (this.face == "forward"){this.agent_pos[2] += .2} 
            if (this.face == "backward") {this.agent_pos[2] -= .2}
            if (this.face == "left") {this.agent_pos[0] += .2}
            if (this.face == "right") {this.agent_pos[0] -= .2}
            this.stop_human_figure()  // let move = false
            
        }
        else{this.stop_human_figure()}

            // 
            this.agent_trans = Mat4.translation(this.agent_pos[0], this.agent_pos[1], this.agent_pos[2]).times(Mat4.rotation(this.agent_rot[0],0,1,0)).
                times(Mat4.scale(this.agent_size,this.agent_size,this.agent_size));
            console.log(this.agent_pos)

            //Synchronizes the center position of a character model with its actual position in world space.
            this.shapes.human.center_x[0] = this.agent_pos[0]
            this.shapes.human.center_x[1] = this.agent_pos[1]
            this.shapes.human.center_x[2] = this.agent_pos[2]
            this.shapes.human.update_bound()

            this.shapes.human.draw(context, program_state, this.agent_trans)

            const check = (element) => this.shapes.human.bound.intersects(element.bound) == true
            const check2 = (element) => this.shapes.ball.bound.intersects(element.bound) == true

        if (this.still_items.some(check) || this.shapes.human.bound.intersects (this.shapes.ball.bound)) {
            //this.shapes.human.bound.find_face_normal(this.shapes.ball.bound)
            this.collision = true
            
        }
        else {
            this.collision = false
        }

        // ball collision check
        if (this.still_items.some(check2)&&this.kick) {

            this.ball_collision = true
            console.log("true")
            //this.kick=false
        } 
        else if (this.shapes.field.bound.intersects2(this.shapes.ball.bound)) {
            //this.ball_collision = true, may delete this in future
            
        }
        else {
            if(!this.kick)
            {
                console.log("false")
                this.ball_collision = false
            }
        }


        


    
        let field_transform = Mat4.identity()
                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0)) // Rotate to lay it flat
                        .times(Mat4.scale(80, 80, 80)); // Scale to the size of a soccer field
        this.shapes.field.draw(context, program_state, field_transform, this.materials.grass.override({color:hex_color("99ff66")}));
        
        // box 是表示四周的环境，我们可以改成其他的景色
        this.shapes.sphere.draw(context, program_state, Mat4.identity().times(Mat4.rotation(Math.PI/1.5, 0,1,0)).times(Mat4.scale(80, 80, 80)), this.materials.sky)

        // Checking kick
        if(this.kick)
            this.kicking_ball(this.shapes.ball)
        // Drawing ball
        let ball_model_transform = Mat4.translation(this.ball_pos[0], this.ball_pos[1], this.ball_pos[2])
        //console.log(this.ball_pos)
                                                    
        this.shapes.ball.center_x[0] = this.ball_pos[0]
        this.shapes.ball.center_x[1] = this.ball_pos[1]
        this.shapes.ball.center_x[2] = this.ball_pos[2]
        this.shapes.ball.update_bound()
        this.shapes.ball.draw(context, program_state, ball_model_transform)
        
        
        
        //移动鸡，到距离转方向转面
        this.temp -= this.move_chicken(this.shapes.chicken)
        if (this.temp <= 0) {
            this.chicken_direction = !this.chicken_direction
            this.direction = - this.direction
            this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0))
            this.temp = this.length
        }
        this.check_goal()
        // only check the bound when not getting
        if(!this.get_goal)
            this.check_out_of_bound()
        //视角转换， this.first == true: 第一人称
        if (this.first) {
            //console.log(this.agent_trans)
        
        program_state.camera_inverse = Mat4.rotation(Math.PI/10, 1, 0, 0).times(Mat4.translation(-this.agent_pos[0],this.agent_pos[1] -8,-this.agent_pos[2] - 12)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1))}
        else if (this.second) {
            program_state.camera_inverse = Mat4.rotation(Math.PI/2, 0, 1, 0).times(Mat4.rotation(Math.PI/12, 0, 0, 1)).times(Mat4.translation(45, -12, 0))
        }
        else if (this.third) {
            program_state.camera_inverse = Mat4.rotation(-Math.PI/2, 0, 1, 0).times(Mat4.rotation(-Math.PI/12, 0, 0, 1)).times(Mat4.translation(-45, -12, 0))
        }
        else {program_state.set_camera(this.initial_camera_location)}
        //else {program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)))}

        //画障碍物
        for (let i of this.still_items) {
            i.draw(context, program_state, Mat4.identity(), this.materials.phong)
        } 

        
    } 
}


